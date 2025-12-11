<?php

namespace App\Reports;

use App\Models\Disposal;
use Illuminate\Support\Collection;

/**
 * Disposal Report
 *
 * Disposed items, disposal methods, costs, reasons
 */
class DisposalReport extends BaseReport
{
    public function getName(): string
    {
        return 'disposal';
    }

    public function getTitle(): string
    {
        return 'Disposal Report';
    }

    public function getDescription(): string
    {
        return 'Disposed items, methods, costs, and disposal reasons tracking';
    }

    public function generate(array $filters = []): Collection
    {
        [$dateFrom, $dateTo] = $this->getDateRange($filters);

        $query = Disposal::query()
            ->with(['item.category', 'requestedBy', 'approvedBy', 'executedBy'])
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['disposal_method'] ?? null, fn($q, $v) => $q->where('disposal_method', $v))
            ->when($dateFrom, fn($q) => $q->where('executed_at', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->where('executed_at', '<=', $dateTo))
            ->orderBy('executed_at', 'desc');

        return $query->get()->map(function ($disposal) {
            return [
                'property_number' => $disposal->item->property_number,
                'item_name' => $disposal->item->name,
                'category' => $disposal->item->category?->name ?? 'N/A',
                'reason' => $disposal->reason,
                'disposal_method' => $disposal->disposal_method,
                'status' => $disposal->status,
                'acquisition_cost' => (float) ($disposal->item->acquisition_cost ?? 0),
                'acquisition_cost_formatted' => $this->formatCurrency($disposal->item->acquisition_cost),
                'disposal_cost' => (float) ($disposal->disposal_cost ?? 0),
                'disposal_cost_formatted' => $this->formatCurrency($disposal->disposal_cost),
                'requested_at' => $disposal->requested_at,
                'approved_at' => $disposal->approved_at,
                'executed_at' => $disposal->executed_at,
                'requested_by' => $disposal->requestedBy?->name ?? 'N/A',
                'approved_by' => $disposal->approvedBy?->name ?? 'N/A',
                'executed_by' => $disposal->executedBy?->name ?? 'N/A',
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'property_number' => 'Property Number',
            'item_name' => 'Item Name',
            'category' => 'Category',
            'reason' => 'Reason',
            'disposal_method' => 'Method',
            'status' => 'Status',
            'acquisition_cost_formatted' => 'Original Cost',
            'disposal_cost_formatted' => 'Disposal Cost',
            'requested_at' => 'Requested Date',
            'approved_at' => 'Approved Date',
            'executed_at' => 'Executed Date',
            'approved_by' => 'Approved By',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $totalOriginalValue = $data->sum('acquisition_cost');
        $totalDisposalCost = $data->sum('disposal_cost');

        $byMethod = $data->groupBy('disposal_method')->map(function ($items, $method) {
            return [
                'method' => $method,
                'count' => $items->count(),
                'total_cost' => $this->formatCurrency($items->sum('disposal_cost')),
            ];
        })->values();

        $byReason = $data->groupBy('reason')->map(function ($items, $reason) use ($data) {
            return [
                'reason' => $reason,
                'count' => $items->count(),
                'percentage' => $this->formatPercentage(
                    $this->calculatePercentage($items->count(), $data->count())
                ),
            ];
        })->values();

        return [
            'total_disposals' => $data->count(),
            'total_original_value' => $this->formatCurrency($totalOriginalValue),
            'total_disposal_cost' => $this->formatCurrency($totalDisposalCost),
            'by_method' => $byMethod,
            'by_reason' => $byReason,
        ];
    }

    public function getAvailableFilters(): array
    {
        return array_merge($this->getCommonDateFilters(), [
            'status' => [
                'type' => 'select',
                'label' => 'Status',
                'options' => [
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                    'executed' => 'Executed',
                ],
            ],
            'disposal_method' => [
                'type' => 'select',
                'label' => 'Disposal Method',
                'options' => [
                    'sale' => 'Sale',
                    'donation' => 'Donation',
                    'recycling' => 'Recycling',
                    'destruction' => 'Destruction',
                    'other' => 'Other',
                ],
            ],
        ]);
    }
}
