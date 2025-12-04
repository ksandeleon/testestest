<?php

namespace App\Observers;

use App\Models\Assignment;
use App\Models\Item;
use App\Services\ItemService;
use Illuminate\Support\Facades\Log;

class AssignmentObserver
{
    protected ItemService $itemService;

    public function __construct(ItemService $itemService)
    {
        $this->itemService = $itemService;
    }

    /**
     * Handle the Assignment "created" event.
     * When assignment is created with STATUS_ACTIVE, mark item as assigned.
     */
    public function created(Assignment $assignment): void
    {
        if ($assignment->status === Assignment::STATUS_ACTIVE) {
            $this->updateItemStatus($assignment, Item::STATUS_ASSIGNED);
        }
    }

    /**
     * Handle the Assignment "updated" event.
     * Update item status based on assignment status changes.
     */
    public function updated(Assignment $assignment): void
    {
        // Only react to status changes
        if (!$assignment->wasChanged('status')) {
            return;
        }

        $item = $assignment->item;

        // Handle status transitions
        match ($assignment->status) {
            Assignment::STATUS_ACTIVE => $this->updateItemStatus($assignment, Item::STATUS_ASSIGNED),
            Assignment::STATUS_RETURNED => $this->handleReturn($assignment),
            Assignment::STATUS_CANCELLED => $this->handleCancellation($assignment),
            default => null,
        };
    }

    /**
     * Handle the Assignment "deleted" event.
     * If assignment is deleted, return item to available status (if not soft-deleted).
     */
    public function deleted(Assignment $assignment): void
    {
        // Only update item if the assignment is being soft-deleted
        if (!$assignment->isForceDeleting()) {
            $this->handleCancellation($assignment);
        }
    }

    /**
     * Update item status through the service layer.
     */
    private function updateItemStatus(Assignment $assignment, string $newStatus): void
    {
        $item = $assignment->item;

        if (!$item) {
            return;
        }

        try {
            $this->itemService->changeStatus(
                $item,
                $newStatus,
                "Assignment {$assignment->id} status changed to {$assignment->status}"
            );
        } catch (\InvalidArgumentException $e) {
            // Log the error but don't fail the assignment update
            Log::warning("Could not update item status via AssignmentObserver: " . $e->getMessage(), [
                'assignment_id' => $assignment->id,
                'item_id' => $item->id,
                'attempted_status' => $newStatus,
            ]);
        }
    }

    /**
     * Handle item return - check if there are other active assignments.
     */
    private function handleReturn(Assignment $assignment): void
    {
        $item = $assignment->item;

        if (!$item) {
            return;
        }

        // Check if there are any other active assignments for this item
        $hasOtherActiveAssignments = Assignment::where('item_id', $item->id)
            ->where('id', '!=', $assignment->id)
            ->where('status', Assignment::STATUS_ACTIVE)
            ->exists();

        // Only mark as available if no other active assignments exist
        if (!$hasOtherActiveAssignments) {
            $this->updateItemStatus($assignment, Item::STATUS_AVAILABLE);
        }
    }

    /**
     * Handle assignment cancellation.
     */
    private function handleCancellation(Assignment $assignment): void
    {
        // Same logic as return - make available only if no other active assignments
        $this->handleReturn($assignment);
    }
}
