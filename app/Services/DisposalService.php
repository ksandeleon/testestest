<?php

namespace App\Services;

use App\Exceptions\DisposalException;
use App\Models\Disposal;
use App\Models\Item;
use Illuminate\Support\Facades\DB;

class DisposalService
{
    /**
     * Create a new disposal request.
     */
    public function createDisposal(array $data): Disposal
    {
        return DB::transaction(function () use ($data) {
            $disposal = Disposal::create([
                'item_id' => $data['item_id'],
                'requested_by' => auth()->id(),
                'status' => Disposal::STATUS_PENDING,
                'reason' => $data['reason'],
                'description' => $data['description'],
                'estimated_value' => $data['estimated_value'] ?? null,
                'disposal_method' => $data['disposal_method'] ?? null,
                'recipient' => $data['recipient'] ?? null,
                'scheduled_for' => $data['scheduled_for'] ?? null,
                'attachments' => $data['attachments'] ?? null,
                'requested_at' => now(),
            ]);

            // Update item status to pending disposal
            $item = Item::findOrFail($data['item_id']);
            $item->update(['status' => Item::STATUS_PENDING_DISPOSAL]);

            activity()
                ->performedOn($disposal)
                ->causedBy(auth()->user())
                ->withProperties(['item' => $item->name])
                ->log('Disposal request created');

            return $disposal->load(['item', 'requestedBy']);
        });
    }

    /**
     * Approve a disposal request.
     */
    public function approveDisposal(Disposal $disposal, array $data): Disposal
    {
        if (!$disposal->isPending()) {
            throw DisposalException::cannotApprove();
        }

        return DB::transaction(function () use ($disposal, $data) {
            $disposal->update([
                'status' => Disposal::STATUS_APPROVED,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'approval_notes' => $data['approval_notes'] ?? null,
                'disposal_method' => $data['disposal_method'] ?? $disposal->disposal_method,
                'scheduled_for' => $data['scheduled_for'] ?? $disposal->scheduled_for,
            ]);

            activity()
                ->performedOn($disposal)
                ->causedBy(auth()->user())
                ->log('Disposal request approved');

            return $disposal->load(['item', 'requestedBy', 'approvedBy']);
        });
    }

    /**
     * Reject a disposal request.
     */
    public function rejectDisposal(Disposal $disposal, array $data): Disposal
    {
        if (!$disposal->isPending()) {
            throw DisposalException::cannotReject();
        }

        return DB::transaction(function () use ($disposal, $data) {
            $disposal->update([
                'status' => Disposal::STATUS_REJECTED,
                'approved_by' => auth()->id(),
                'rejected_at' => now(),
                'approval_notes' => $data['approval_notes'],
            ]);

            // Revert item status back to its previous state
            $item = $disposal->item;
            $previousStatus = $this->determinePreviousItemStatus($item);
            $item->update(['status' => $previousStatus]);

            activity()
                ->performedOn($disposal)
                ->causedBy(auth()->user())
                ->log('Disposal request rejected');

            return $disposal->load(['item', 'requestedBy', 'approvedBy']);
        });
    }

    /**
     * Execute a disposal.
     */
    public function executeDisposal(Disposal $disposal, array $data): Disposal
    {
        if (!$disposal->isApproved()) {
            throw DisposalException::cannotExecute();
        }

        return DB::transaction(function () use ($disposal, $data) {
            $disposal->update([
                'status' => Disposal::STATUS_EXECUTED,
                'executed_by' => auth()->id(),
                'executed_at' => now(),
                'execution_notes' => $data['execution_notes'] ?? null,
                'disposal_cost' => $data['disposal_cost'] ?? null,
                'disposal_method' => $data['disposal_method'] ?? $disposal->disposal_method,
                'recipient' => $data['recipient'] ?? $disposal->recipient,
            ]);

            // Update item status to disposed
            $item = $disposal->item;
            $item->update(['status' => Item::STATUS_DISPOSED]);

            activity()
                ->performedOn($disposal)
                ->causedBy(auth()->user())
                ->withProperties([
                    'item' => $item->name,
                    'method' => $disposal->disposal_method,
                ])
                ->log('Disposal executed');

            return $disposal->load(['item', 'requestedBy', 'approvedBy', 'executedBy']);
        });
    }

    /**
     * Get all disposal requests with filters.
     */
    public function getDisposals(array $filters = [])
    {
        $query = Disposal::with(['item', 'requestedBy', 'approvedBy', 'executedBy']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['reason'])) {
            $query->where('reason', $filters['reason']);
        }

        if (isset($filters['search'])) {
            $query->whereHas('item', function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('property_number', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('requested_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('requested_at', '<=', $filters['date_to']);
        }

        return $query->latest('requested_at');
    }

    /**
     * Get pending disposals.
     */
    public function getPendingDisposals()
    {
        return Disposal::pending()
            ->with(['item', 'requestedBy'])
            ->latest('requested_at')
            ->get();
    }

    /**
     * Get disposal statistics.
     */
    public function getDisposalStatistics(): array
    {
        return [
            'total' => Disposal::count(),
            'pending' => Disposal::pending()->count(),
            'approved' => Disposal::approved()->count(),
            'rejected' => Disposal::rejected()->count(),
            'executed' => Disposal::executed()->count(),
            'total_value_disposed' => Disposal::executed()
                ->sum('estimated_value'),
            'total_disposal_cost' => Disposal::executed()
                ->sum('disposal_cost'),
        ];
    }

    /**
     * Get disposal by ID with relationships.
     */
    public function getDisposalById(int $id): Disposal
    {
        return Disposal::with([
            'item.category',
            'item.location',
            'requestedBy',
            'approvedBy',
            'executedBy',
        ])->findOrFail($id);
    }

    /**
     * Determine previous item status based on history.
     */
    protected function determinePreviousItemStatus(Item $item): string
    {
        // Check if item has active assignments
        if ($item->assignments()->where('status', 'active')->exists()) {
            return Item::STATUS_ASSIGNED;
        }

        // Check if item has active maintenance
        if ($item->maintenances()->where('status', 'in_progress')->exists()) {
            return Item::STATUS_UNDER_MAINTENANCE;
        }

        // Default to available
        return Item::STATUS_AVAILABLE;
    }

    /**
     * Cancel a disposal request (only if pending).
     */
    public function cancelDisposal(Disposal $disposal): Disposal
    {
        if (!$disposal->isPending()) {
            throw DisposalException::cannotCancel();
        }

        return DB::transaction(function () use ($disposal) {
            $item = $disposal->item;
            $previousStatus = $this->determinePreviousItemStatus($item);
            $item->update(['status' => $previousStatus]);

            $disposal->delete();

            activity()
                ->performedOn($disposal)
                ->causedBy(auth()->user())
                ->log('Disposal request cancelled');

            return $disposal;
        });
    }
}
