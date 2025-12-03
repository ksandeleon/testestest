<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * AssignmentService - Handles all business logic for item assignments
 *
 * Follows Single Responsibility Principle and Service Layer Pattern
 */
class AssignmentService
{
    /**
     * Create a new assignment.
     *
     * @param array $data
     * @return Assignment
     * @throws InvalidArgumentException
     */
    public function createAssignment(array $data): Assignment
    {
        // Validate item availability
        $item = Item::findOrFail($data['item_id']);

        if ($this->isItemCurrentlyAssigned($item->id)) {
            throw new InvalidArgumentException(
                "Item '{$item->name}' is currently assigned to another user."
            );
        }

        return DB::transaction(function () use ($data, $item) {
            // Create the assignment
            $assignment = Assignment::create([
                'item_id' => $data['item_id'],
                'user_id' => $data['user_id'],
                'assigned_by' => $data['assigned_by'],
                'status' => $data['status'] ?? Assignment::STATUS_ACTIVE,
                'assigned_date' => $data['assigned_date'] ?? now(),
                'due_date' => $data['due_date'] ?? null,
                'purpose' => $data['purpose'] ?? null,
                'notes' => $data['notes'] ?? null,
                'admin_notes' => $data['admin_notes'] ?? null,
                'condition_on_assignment' => $data['condition_on_assignment'] ?? $item->condition,
            ]);

            // Update item status
            $item->update([
                'status' => 'assigned',
            ]);

            return $assignment;
        });
    }

    /**
     * Update an existing assignment.
     *
     * @param Assignment $assignment
     * @param array $data
     * @return Assignment
     */
    public function updateAssignment(Assignment $assignment, array $data): Assignment
    {
        $assignment->update(array_filter([
            'due_date' => $data['due_date'] ?? $assignment->due_date,
            'purpose' => $data['purpose'] ?? $assignment->purpose,
            'notes' => $data['notes'] ?? $assignment->notes,
            'admin_notes' => $data['admin_notes'] ?? $assignment->admin_notes,
        ]));

        return $assignment->fresh();
    }

    /**
     * Cancel an assignment.
     *
     * @param Assignment $assignment
     * @return Assignment
     */
    public function cancelAssignment(Assignment $assignment): Assignment
    {
        return DB::transaction(function () use ($assignment) {
            $assignment->cancel();

            // Make item available again
            $assignment->item->update([
                'status' => 'available',
            ]);

            return $assignment;
        });
    }

    /**
     * Approve a pending assignment.
     *
     * @param Assignment $assignment
     * @return Assignment
     */
    public function approveAssignment(Assignment $assignment): Assignment
    {
        if ($assignment->status !== Assignment::STATUS_PENDING) {
            throw new InvalidArgumentException('Only pending assignments can be approved.');
        }

        $assignment->approve();

        return $assignment;
    }

    /**
     * Get all assignments for a user.
     *
     * @param int $userId
     * @param string|null $status
     * @return Collection
     */
    public function getUserAssignments(int $userId, ?string $status = null): Collection
    {
        $query = Assignment::where('user_id', $userId)
            ->with(['item', 'assignedBy']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest()->get();
    }

    /**
     * Get all assignments for an item.
     *
     * @param int $itemId
     * @return Collection
     */
    public function getItemAssignments(int $itemId): Collection
    {
        return Assignment::where('item_id', $itemId)
            ->with(['user', 'assignedBy'])
            ->latest()
            ->get();
    }

    /**
     * Get overdue assignments.
     *
     * @return Collection
     */
    public function getOverdueAssignments(): Collection
    {
        return Assignment::overdue()
            ->with(['item', 'user'])
            ->get();
    }

    /**
     * Check if an item is currently assigned.
     *
     * @param int $itemId
     * @return bool
     */
    public function isItemCurrentlyAssigned(int $itemId): bool
    {
        return Assignment::where('item_id', $itemId)
            ->where('status', Assignment::STATUS_ACTIVE)
            ->exists();
    }

    /**
     * Get assignment statistics for a user.
     *
     * @param int $userId
     * @return array
     */
    public function getUserAssignmentStats(int $userId): array
    {
        $assignments = Assignment::where('user_id', $userId);

        return [
            'total' => $assignments->count(),
            'active' => (clone $assignments)->active()->count(),
            'returned' => (clone $assignments)->returned()->count(),
            'overdue' => (clone $assignments)->overdue()->count(),
        ];
    }

    /**
     * Bulk assign items to a user.
     *
     * @param array $itemIds
     * @param int $userId
     * @param int $assignedBy
     * @param array $additionalData
     * @return Collection
     */
    public function bulkAssign(
        array $itemIds,
        int $userId,
        int $assignedBy,
        array $additionalData = []
    ): Collection {
        $assignments = collect();

        DB::transaction(function () use ($itemIds, $userId, $assignedBy, $additionalData, &$assignments) {
            foreach ($itemIds as $itemId) {
                try {
                    $assignment = $this->createAssignment([
                        'item_id' => $itemId,
                        'user_id' => $userId,
                        'assigned_by' => $assignedBy,
                        ...$additionalData,
                    ]);

                    $assignments->push($assignment);
                } catch (InvalidArgumentException $e) {
                    // Skip already assigned items
                    continue;
                }
            }
        });

        return $assignments;
    }

    /**
     * Get assignment summary statistics.
     *
     * @return array
     */
    public function getAssignmentSummary(): array
    {
        return [
            'total' => Assignment::count(),
            'active' => Assignment::active()->count(),
            'pending' => Assignment::pending()->count(),
            'returned' => Assignment::returned()->count(),
            'overdue' => Assignment::overdue()->count(),
            'cancelled' => Assignment::where('status', Assignment::STATUS_CANCELLED)->count(),
        ];
    }
}
