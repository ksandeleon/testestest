<?php

namespace App\Reports;

use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Inventory Summary Report
 *
 * Shows total items by category, location, status, and value
 */
class InventorySummaryReport extends BaseReport
{
    public function getName(): string
    {
        return 'inventory_summary';
    }

    public function getTitle(): string
    {
        return 'Inventory Summary Report';
    }

    public function getDescription(): string
    {
        return 'Overview of all items by category, location, status, and total value';
    }

    public function generate(array $filters = []): Collection
    {
        $query = Item::query()
            ->with(['category', 'location'])
            ->when($filters['category_id'] ?? null, fn($q, $v) => $q->where('category_id', $v))
            ->when($filters['location_id'] ?? null, fn($q, $v) => $q->where('location_id', $v))
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v));

        return $query->get()->map(function ($item) {
            return [
                'property_number' => $item->property_number,
                'name' => $item->name,
                'brand' => $item->brand,
                'model' => $item->model,
                'category' => $item->category?->name ?? 'N/A',
                'location' => $item->location?->name ?? 'N/A',
                'status' => $item->status,
                'condition' => $item->condition,
                'acquisition_cost' => (float) $item->acquisition_cost,
                'acquisition_cost_formatted' => $this->formatCurrency($item->acquisition_cost),
                'acquisition_date' => $item->acquisition_date,
                'warranty_expiry' => $item->warranty_expiry,
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'property_number' => 'Property Number',
            'name' => 'Item Name',
            'brand' => 'Brand',
            'model' => 'Model',
            'category' => 'Category',
            'location' => 'Location',
            'status' => 'Status',
            'condition' => 'Condition',
            'acquisition_cost_formatted' => 'Acquisition Cost',
            'acquisition_date' => 'Acquisition Date',
            'warranty_expiry' => 'Warranty Expiry',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $totalValue = $data->sum('acquisition_cost');
        $totalItems = $data->count();

        // Group by category
        $byCategory = $data->groupBy('category')->map(function ($items, $category) {
            return [
                'category' => $category,
                'count' => $items->count(),
                'value' => $this->formatCurrency($items->sum('acquisition_cost')),
            ];
        })->values();

        // Group by status
        $byStatus = $data->groupBy('status')->map(function ($items, $status) use ($data) {
            return [
                'status' => $status,
                'count' => $items->count(),
                'percentage' => $this->formatPercentage(
                    $this->calculatePercentage($items->count(), $data->count())
                ),
            ];
        })->values();

        // Group by location
        $byLocation = $data->groupBy('location')->map(function ($items, $location) {
            return [
                'location' => $location,
                'count' => $items->count(),
            ];
        })->values();

        return [
            'total_items' => $totalItems,
            'total_value' => $this->formatCurrency($totalValue),
            'by_category' => $byCategory,
            'by_status' => $byStatus,
            'by_location' => $byLocation,
        ];
    }

    public function getAvailableFilters(): array
    {
        return [
            'category_id' => [
                'type' => 'select',
                'label' => 'Category',
                'options' => Category::orderBy('name')->pluck('name', 'id'),
            ],
            'location_id' => [
                'type' => 'select',
                'label' => 'Location',
                'options' => Location::orderBy('name')->pluck('name', 'id'),
            ],
            'status' => [
                'type' => 'select',
                'label' => 'Status',
                'options' => [
                    'available' => 'Available',
                    'assigned' => 'Assigned',
                    'in_maintenance' => 'In Maintenance',
                    'damaged' => 'Damaged',
                    'for_disposal' => 'For Disposal',
                    'disposed' => 'Disposed',
                ],
            ],
        ];
    }
}
