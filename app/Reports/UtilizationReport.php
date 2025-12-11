<?php

namespace App\Reports;

use App\Models\Assignment;
use App\Models\Item;
use Illuminate\Support\Collection;

/**
 * Utilization Report
 *
 * Item usage statistics, most/least used items
 */
class UtilizationReport extends BaseReport
{
    public function getName(): string
    {
        return 'utilization';
    }

    public function getTitle(): string
    {
        return 'Utilization Report';
    }

    public function getDescription(): string
    {
        return 'Item usage statistics, assignment frequency, and utilization rates';
    }

    public function generate(array $filters = []): Collection
    {
        [$dateFrom, $dateTo] = $this->getDateRange($filters);

        $items = Item::query()
            ->with(['category', 'location', 'assignments'])
            ->when($filters['category_id'] ?? null, fn($q, $v) => $q->where('category_id', $v))
            ->get();

        return $items->map(function ($item) use ($dateFrom, $dateTo) {
            $assignments = $item->assignments()
                ->when($dateFrom, fn($q) => $q->where('assigned_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->where('assigned_at', '<=', $dateTo))
                ->get();

            $totalDaysAssigned = $assignments->sum(function ($assignment) {
                $start = $assignment->assigned_at;
                $end = $assignment->returned_at ?? now();
                return $start->diffInDays($end);
            });

            $dateRange = $dateFrom && $dateTo ? $dateFrom->diffInDays($dateTo) : 30;
            $utilizationRate = $dateRange > 0 ? ($totalDaysAssigned / $dateRange) * 100 : 0;

            return [
                'property_number' => $item->property_number,
                'item_name' => $item->name,
                'category' => $item->category?->name ?? 'N/A',
                'location' => $item->location?->name ?? 'N/A',
                'status' => $item->status,
                'total_assignments' => $assignments->count(),
                'total_days_assigned' => $totalDaysAssigned,
                'utilization_rate' => round($utilizationRate, 2),
                'utilization_rate_formatted' => $this->formatPercentage($utilizationRate),
                'current_status' => $item->status,
                'last_assigned_at' => $assignments->first()?->assigned_at?->format('Y-m-d'),
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'property_number' => 'Property Number',
            'item_name' => 'Item Name',
            'category' => 'Category',
            'location' => 'Location',
            'total_assignments' => 'Total Assignments',
            'total_days_assigned' => 'Days Assigned',
            'utilization_rate_formatted' => 'Utilization Rate',
            'current_status' => 'Current Status',
            'last_assigned_at' => 'Last Assigned',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $mostUsed = $data->sortByDesc('total_assignments')->take(5)->map(function ($item) {
            return [
                'item' => $item['item_name'],
                'assignments' => $item['total_assignments'],
            ];
        })->values();

        $leastUsed = $data->sortBy('total_assignments')->take(5)->map(function ($item) {
            return [
                'item' => $item['item_name'],
                'assignments' => $item['total_assignments'],
            ];
        })->values();

        $highUtilization = $data->filter(fn($item) => $item['utilization_rate'] > 75)->count();
        $mediumUtilization = $data->filter(fn($item) => $item['utilization_rate'] >= 25 && $item['utilization_rate'] <= 75)->count();
        $lowUtilization = $data->filter(fn($item) => $item['utilization_rate'] < 25)->count();

        return [
            'total_items' => $data->count(),
            'average_utilization_rate' => $this->formatPercentage($data->avg('utilization_rate')),
            'total_assignments' => $data->sum('total_assignments'),
            'high_utilization' => $highUtilization,
            'medium_utilization' => $mediumUtilization,
            'low_utilization' => $lowUtilization,
            'most_used_items' => $mostUsed,
            'least_used_items' => $leastUsed,
        ];
    }

    public function getAvailableFilters(): array
    {
        return array_merge($this->getCommonDateFilters(), [
            'category_id' => [
                'type' => 'select',
                'label' => 'Category',
                'options' => \App\Models\Category::orderBy('name')->pluck('name', 'id'),
            ],
        ]);
    }
}
