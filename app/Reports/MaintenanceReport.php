<?php

namespace App\Reports;

use App\Models\Maintenance;
use Illuminate\Support\Collection;

/**
 * Maintenance Report
 *
 * Scheduled vs completed maintenance, costs by item/category, technician performance
 */
class MaintenanceReport extends BaseReport
{
    public function getName(): string
    {
        return 'maintenance';
    }

    public function getTitle(): string
    {
        return 'Maintenance Report';
    }

    public function getDescription(): string
    {
        return 'Maintenance activities, costs, technician performance, and scheduling overview';
    }

    public function generate(array $filters = []): Collection
    {
        [$dateFrom, $dateTo] = $this->getDateRange($filters);

        $query = Maintenance::query()
            ->with(['item.category', 'assignedTo', 'requestedBy'])
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['maintenance_type'] ?? null, fn($q, $v) => $q->where('maintenance_type', $v))
            ->when($filters['assigned_to'] ?? null, fn($q, $v) => $q->where('assigned_to', $v))
            ->when($dateFrom, fn($q) => $q->where('scheduled_date', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->where('scheduled_date', '<=', $dateTo))
            ->orderBy('scheduled_date', 'desc');

        return $query->get()->map(function ($maintenance) {
            return [
                'title' => $maintenance->title,
                'item_name' => $maintenance->item->name,
                'property_number' => $maintenance->item->property_number,
                'category' => $maintenance->item->category?->name ?? 'N/A',
                'maintenance_type' => $maintenance->maintenance_type,
                'status' => $maintenance->status,
                'priority' => $maintenance->priority,
                'scheduled_date' => $maintenance->scheduled_date,
                'completed_at' => $maintenance->completed_at,
                'estimated_cost' => (float) ($maintenance->estimated_cost ?? 0),
                'estimated_cost_formatted' => $this->formatCurrency($maintenance->estimated_cost),
                'actual_cost' => (float) ($maintenance->actual_cost ?? 0),
                'actual_cost_formatted' => $this->formatCurrency($maintenance->actual_cost),
                'cost_variance' => $this->calculateVariance(
                    $maintenance->estimated_cost,
                    $maintenance->actual_cost
                ),
                'assigned_to' => $maintenance->assignedTo?->name ?? 'Unassigned',
                'requested_by' => $maintenance->requestedBy?->name ?? 'N/A',
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'title' => 'Title',
            'item_name' => 'Item',
            'property_number' => 'Property Number',
            'category' => 'Category',
            'maintenance_type' => 'Type',
            'status' => 'Status',
            'priority' => 'Priority',
            'scheduled_date' => 'Scheduled Date',
            'completed_at' => 'Completed Date',
            'estimated_cost_formatted' => 'Estimated Cost',
            'actual_cost_formatted' => 'Actual Cost',
            'cost_variance' => 'Cost Variance',
            'assigned_to' => 'Technician',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $totalEstimatedCost = $data->sum('estimated_cost');
        $totalActualCost = $data->sum('actual_cost');

        $byStatus = $data->groupBy('status')->map(function ($items, $status) use ($data) {
            return [
                'status' => $status,
                'count' => $items->count(),
                'percentage' => $this->formatPercentage(
                    $this->calculatePercentage($items->count(), $data->count())
                ),
            ];
        })->values();

        $byType = $data->groupBy('maintenance_type')->map(function ($items, $type) {
            return [
                'type' => $type,
                'count' => $items->count(),
                'total_cost' => $this->formatCurrency($items->sum('actual_cost')),
            ];
        })->values();

        return [
            'total_maintenance' => $data->count(),
            'completed' => $data->where('status', 'completed')->count(),
            'in_progress' => $data->where('status', 'in_progress')->count(),
            'scheduled' => $data->where('status', 'scheduled')->count(),
            'total_estimated_cost' => $this->formatCurrency($totalEstimatedCost),
            'total_actual_cost' => $this->formatCurrency($totalActualCost),
            'cost_variance' => $this->calculateVariance($totalEstimatedCost, $totalActualCost),
            'by_status' => $byStatus,
            'by_type' => $byType,
        ];
    }

    public function getAvailableFilters(): array
    {
        return array_merge($this->getCommonDateFilters(), [
            'status' => [
                'type' => 'select',
                'label' => 'Status',
                'options' => [
                    'scheduled' => 'Scheduled',
                    'in_progress' => 'In Progress',
                    'completed' => 'Completed',
                    'cancelled' => 'Cancelled',
                ],
            ],
            'maintenance_type' => [
                'type' => 'select',
                'label' => 'Type',
                'options' => [
                    'preventive' => 'Preventive',
                    'corrective' => 'Corrective',
                    'inspection' => 'Inspection',
                ],
            ],
            'assigned_to' => [
                'type' => 'select',
                'label' => 'Technician',
                'options' => \App\Models\User::role('maintenance_coordinator')
                    ->orderBy('name')
                    ->pluck('name', 'id'),
            ],
        ]);
    }

    /**
     * Calculate cost variance
     */
    private function calculateVariance(?float $estimated, ?float $actual): string
    {
        if (!$estimated || !$actual) {
            return 'N/A';
        }

        $variance = $actual - $estimated;
        $percentage = $this->calculatePercentage($variance, $estimated);

        return $this->formatCurrency($variance) . ' (' . $this->formatPercentage($percentage) . ')';
    }
}
