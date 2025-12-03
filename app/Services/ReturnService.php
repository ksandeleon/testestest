<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\ItemReturn;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * ReturnService - Handles all business logic for item returns
 *
 * Follows Single Responsibility Principle and Service Layer Pattern
 */
class ReturnService
{
    /**
     * Create a return for an assignment.
     *
     * @param Assignment $assignment
     * @param array $data
     * @return ItemReturn
     * @throws InvalidArgumentException
     */
    public function createReturn(Assignment $assignment, array $data): ItemReturn
    {
        if ($assignment->status === Assignment::STATUS_RETURNED) {
            throw new InvalidArgumentException('This assignment has already been returned.');
        }

        if (!in_array($assignment->status, [Assignment::STATUS_ACTIVE, Assignment::STATUS_APPROVED])) {
            throw new InvalidArgumentException('Only active or approved assignments can be returned.');
        }

        return DB::transaction(function () use ($assignment, $data) {
            // Create the return record
            $return = ItemReturn::create([
                'assignment_id' => $assignment->id,
                'returned_by' => $data['returned_by'],
                'return_date' => $data['return_date'] ?? now(),
                'condition_on_return' => $data['condition_on_return'],
                'is_damaged' => $data['is_damaged'] ?? false,
                'damage_description' => $data['damage_description'] ?? null,
                'damage_images' => $data['damage_images'] ?? null,
                'return_notes' => $data['return_notes'] ?? null,
                'status' => ItemReturn::STATUS_PENDING_INSPECTION,
            ]);

            // Calculate if return is late
            $return->calculateLateDays();

            // Mark assignment as returned
            $assignment->markAsReturned();

            return $return;
        });
    }

    /**
     * Inspect a returned item.
     *
     * @param ItemReturn $return
     * @param User $inspector
     * @param array $inspectionData
     * @return ItemReturn
     */
    public function inspectReturn(ItemReturn $return, User $inspector, array $inspectionData): ItemReturn
    {
        if (!$return->isPendingInspection()) {
            throw new InvalidArgumentException('This return has already been inspected.');
        }

        DB::transaction(function () use ($return, $inspector, $inspectionData) {
            $return->markAsInspected($inspector, [
                'inspection_notes' => $inspectionData['inspection_notes'] ?? null,
                'is_damaged' => $inspectionData['is_damaged'] ?? $return->is_damaged,
                'damage_description' => $inspectionData['damage_description'] ?? $return->damage_description,
            ]);

            // Update item condition based on inspection
            if (isset($inspectionData['item_condition'])) {
                $return->assignment->item->update([
                    'condition' => $inspectionData['item_condition'],
                ]);
            }
        });

        return $return->fresh();
    }

    /**
     * Approve a return and make item available.
     *
     * @param ItemReturn $return
     * @return ItemReturn
     */
    public function approveReturn(ItemReturn $return): ItemReturn
    {
        if (!$return->isInspected()) {
            throw new InvalidArgumentException('Return must be inspected before approval.');
        }

        return DB::transaction(function () use ($return) {
            $return->approve();

            // Make item available again (unless damaged)
            $newStatus = $return->is_damaged ? 'damaged' : 'available';

            $return->assignment->item->update([
                'status' => $newStatus,
            ]);

            return $return;
        });
    }

    /**
     * Reject a return.
     *
     * @param ItemReturn $return
     * @param string $reason
     * @return ItemReturn
     */
    public function rejectReturn(ItemReturn $return, string $reason): ItemReturn
    {
        $return->update([
            'status' => ItemReturn::STATUS_REJECTED,
            'inspection_notes' => $reason,
        ]);

        return $return;
    }

    /**
     * Get all returns for a user.
     *
     * @param int $userId
     * @return Collection
     */
    public function getUserReturns(int $userId): Collection
    {
        return ItemReturn::whereHas('assignment', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['assignment.item', 'returnedBy', 'inspectedBy'])
        ->latest()
        ->get();
    }

    /**
     * Get pending inspections.
     *
     * @return Collection
     */
    public function getPendingInspections(): Collection
    {
        return ItemReturn::pendingInspection()
            ->with(['assignment.item', 'assignment.user', 'returnedBy'])
            ->latest()
            ->get();
    }

    /**
     * Get damaged returns.
     *
     * @return Collection
     */
    public function getDamagedReturns(): Collection
    {
        return ItemReturn::damaged()
            ->with(['assignment.item', 'assignment.user', 'inspectedBy'])
            ->latest()
            ->get();
    }

    /**
     * Get late returns.
     *
     * @return Collection
     */
    public function getLateReturns(): Collection
    {
        return ItemReturn::late()
            ->with(['assignment.item', 'assignment.user'])
            ->latest()
            ->get();
    }

    /**
     * Calculate penalty for late return.
     *
     * @param ItemReturn $return
     * @param float $penaltyPerDay
     * @return float
     */
    public function calculatePenalty(ItemReturn $return, float $penaltyPerDay = 10.00): float
    {
        if (!$return->is_late) {
            return 0;
        }

        $penalty = $return->days_late * $penaltyPerDay;

        $return->update(['penalty_amount' => $penalty]);

        return $penalty;
    }

    /**
     * Mark penalty as paid.
     *
     * @param ItemReturn $return
     * @return ItemReturn
     */
    public function markPenaltyAsPaid(ItemReturn $return): ItemReturn
    {
        $return->update(['penalty_paid' => true]);

        return $return;
    }

    /**
     * Get return statistics.
     *
     * @return array
     */
    public function getReturnStatistics(): array
    {
        return [
            'total' => ItemReturn::count(),
            'pending_inspection' => ItemReturn::pendingInspection()->count(),
            'inspected' => ItemReturn::inspected()->count(),
            'approved' => ItemReturn::approved()->count(),
            'damaged' => ItemReturn::damaged()->count(),
            'late' => ItemReturn::late()->count(),
            'total_penalties' => ItemReturn::sum('penalty_amount'),
            'unpaid_penalties' => ItemReturn::where('penalty_paid', false)->sum('penalty_amount'),
        ];
    }

    /**
     * Quick return - for simple returns without inspection needed.
     *
     * @param Assignment $assignment
     * @param User $user
     * @param string $condition
     * @return ItemReturn
     */
    public function quickReturn(Assignment $assignment, User $user, string $condition = 'good'): ItemReturn
    {
        return DB::transaction(function () use ($assignment, $user, $condition) {
            // Create return
            $return = $this->createReturn($assignment, [
                'returned_by' => $user->id,
                'condition_on_return' => $condition,
                'is_damaged' => $condition === ItemReturn::CONDITION_DAMAGED,
            ]);

            // Auto-inspect if condition is good
            if ($condition === ItemReturn::CONDITION_GOOD) {
                $this->inspectReturn($return, $user, [
                    'inspection_notes' => 'Auto-approved - good condition',
                    'is_damaged' => false,
                    'item_condition' => 'good',
                ]);

                $this->approveReturn($return->fresh());
            }

            return $return->fresh();
        });
    }
}
