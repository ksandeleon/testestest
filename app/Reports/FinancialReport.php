<?php

namespace App\Reports;

use App\Models\Item;
use App\Models\Maintenance;
use Illuminate\Support\Collection;

/**
 * Financial Report
 *
 * Item costs, maintenance costs, disposal costs, total asset value
 */
class FinancialReport extends BaseReport
{
    public function getName(): string
    {
        return 'financial';
    }

    public function getTitle(): string
    {
        return 'Financial Report';
    }

    public function getDescription(): string
    {
        return 'Asset values, acquisition costs, maintenance expenses, and financial summary';
    }

    public function generate(array $filters = []): Collection
    {
        [$dateFrom, $dateTo] = $this->getDateRange($filters);

        $items = Item::query()
            ->with(['category', 'maintenances'])
            ->when($filters['category_id'] ?? null, fn($q, $v) => $q->where('category_id', $v))
            ->get();

        return $items->map(function ($item) use ($dateFrom, $dateTo) {
            $maintenances = $item->maintenances()
                ->when($dateFrom, fn($q) => $q->where('completed_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->where('completed_at', '<=', $dateTo))
                ->get();

            $maintenanceCost = $maintenances->sum('actual_cost') ?: 0;

            return [
                'property_number' => $item->property_number,
                'item_name' => $item->name,
                'category' => $item->category?->name ?? 'N/A',
                'acquisition_cost' => (float) $item->acquisition_cost,
                'acquisition_cost_formatted' => $this->formatCurrency($item->acquisition_cost),
                'acquisition_date' => $item->acquisition_date,
                'maintenance_count' => $maintenances->count(),
                'maintenance_cost' => $maintenanceCost,
                'maintenance_cost_formatted' => $this->formatCurrency($maintenanceCost),
                'total_cost' => (float) $item->acquisition_cost + $maintenanceCost,
                'total_cost_formatted' => $this->formatCurrency(
                    (float) $item->acquisition_cost + $maintenanceCost
                ),
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'property_number' => 'Property Number',
            'item_name' => 'Item Name',
            'category' => 'Category',
            'acquisition_cost_formatted' => 'Acquisition Cost',
            'acquisition_date' => 'Acquisition Date',
            'maintenance_count' => 'Maintenance Count',
            'maintenance_cost_formatted' => 'Maintenance Cost',
            'total_cost_formatted' => 'Total Cost',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $totalAcquisitionCost = $data->sum('acquisition_cost');
        $totalMaintenanceCost = $data->sum('maintenance_cost');
        $totalCost = $totalAcquisitionCost + $totalMaintenanceCost;

        return [
            'total_items' => $data->count(),
            'total_acquisition_cost' => $this->formatCurrency($totalAcquisitionCost),
            'total_maintenance_cost' => $this->formatCurrency($totalMaintenanceCost),
            'total_cost' => $this->formatCurrency($totalCost),
            'average_acquisition_cost' => $this->formatCurrency($data->avg('acquisition_cost')),
            'average_maintenance_cost' => $this->formatCurrency($data->avg('maintenance_cost')),
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
