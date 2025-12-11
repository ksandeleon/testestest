<?php

namespace App\Reports;

use App\Models\Item;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

/**
 * Item History Report
 *
 * Complete lifecycle of specific items - assignments, maintenance, transfers
 */
class ItemHistoryReport extends BaseReport
{
    public function getName(): string
    {
        return 'item_history';
    }

    public function getTitle(): string
    {
        return 'Item History Report';
    }

    public function getDescription(): string
    {
        return 'Complete lifecycle history of items including assignments, maintenance, and transfers';
    }

    public function generate(array $filters = []): Collection
    {
        [$dateFrom, $dateTo] = $this->getDateRange($filters);

        $query = Activity::query()
            ->where('subject_type', Item::class)
            ->when($filters['item_id'] ?? null, fn($q, $v) => $q->where('subject_id', $v))
            ->when($filters['event'] ?? null, fn($q, $v) => $q->where('event', $v))
            ->when($dateFrom, fn($q) => $q->where('created_at', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->where('created_at', '<=', $dateTo))
            ->with(['subject', 'causer'])
            ->orderBy('created_at', 'desc');

        return $query->get()->map(function ($activity) {
            $item = $activity->subject;
            return [
                'property_number' => $item?->property_number ?? 'N/A',
                'item_name' => $item?->name ?? 'Deleted Item',
                'event' => $activity->event,
                'description' => $activity->description,
                'performed_by' => $activity->causer?->name ?? 'System',
                'performed_at' => $activity->created_at->format('Y-m-d H:i:s'),
                'changes' => $this->formatChanges($activity->properties),
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'property_number' => 'Property Number',
            'item_name' => 'Item Name',
            'event' => 'Event',
            'description' => 'Description',
            'performed_by' => 'Performed By',
            'performed_at' => 'Date/Time',
            'changes' => 'Changes',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $byEvent = $data->groupBy('event')->map(function ($items, $event) {
            return [
                'event' => $event,
                'count' => $items->count(),
            ];
        })->values();

        return [
            'total_activities' => $data->count(),
            'by_event' => $byEvent,
            'unique_items' => $data->pluck('property_number')->unique()->count(),
        ];
    }

    public function getAvailableFilters(): array
    {
        return array_merge($this->getCommonDateFilters(), [
            'item_id' => [
                'type' => 'select',
                'label' => 'Item',
                'options' => Item::orderBy('name')->get()->pluck('property_number', 'id'),
            ],
            'event' => [
                'type' => 'select',
                'label' => 'Event Type',
                'options' => [
                    'created' => 'Created',
                    'updated' => 'Updated',
                    'deleted' => 'Deleted',
                    'assigned' => 'Assigned',
                    'returned' => 'Returned',
                    'maintenance' => 'Maintenance',
                ],
            ],
        ]);
    }

    /**
     * Format activity changes
     */
    private function formatChanges($properties): string
    {
        if (!$properties || !isset($properties['attributes'])) {
            return 'N/A';
        }

        $changes = [];
        $old = $properties['old'] ?? [];
        $new = $properties['attributes'] ?? [];

        foreach ($new as $key => $value) {
            if (isset($old[$key]) && $old[$key] != $value) {
                $changes[] = "{$key}: {$old[$key]} → {$value}";
            }
        }

        return empty($changes) ? 'N/A' : implode(', ', $changes);
    }
}
