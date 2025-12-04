<?php

namespace App\Observers;

use App\Models\Item;
use App\Models\Maintenance;
use App\Services\ItemService;
use Illuminate\Support\Facades\Log;

class MaintenanceObserver
{
    protected ItemService $itemService;

    public function __construct(ItemService $itemService)
    {
        $this->itemService = $itemService;
    }

    /**
     * Handle the Maintenance "created" event.
     * When maintenance is scheduled or in progress, update item status.
     */
    public function created(Maintenance $maintenance): void
    {
        if (in_array($maintenance->status, ['scheduled', 'in_progress'])) {
            $this->updateItemStatus($maintenance, Item::STATUS_UNDER_MAINTENANCE);
        }
    }

    /**
     * Handle the Maintenance "updated" event.
     * Update item status based on maintenance status changes.
     */
    public function updated(Maintenance $maintenance): void
    {
        // Only react to status changes
        if (!$maintenance->wasChanged('status')) {
            return;
        }

        // Handle status transitions
        match ($maintenance->status) {
            'scheduled',
            'in_progress' => $this->updateItemStatus($maintenance, Item::STATUS_UNDER_MAINTENANCE),
            'completed' => $this->handleCompletion($maintenance),
            'cancelled' => $this->handleCancellation($maintenance),
            default => null,
        };
    }

    /**
     * Handle the Maintenance "deleted" event.
     */
    public function deleted(Maintenance $maintenance): void
    {
        // If maintenance is soft-deleted, check if item should return to available
        if (!$maintenance->isForceDeleting()) {
            $this->handleCancellation($maintenance);
        }
    }

    /**
     * Update item status through the service layer.
     */
    private function updateItemStatus(Maintenance $maintenance, string $newStatus): void
    {
        $item = $maintenance->item;

        if (!$item) {
            return;
        }

        try {
            $this->itemService->changeStatus(
                $item,
                $newStatus,
                "Maintenance {$maintenance->id} status changed to {$maintenance->status}"
            );
        } catch (\InvalidArgumentException $e) {
            // Log the error but don't fail the maintenance update
            Log::warning("Could not update item status via MaintenanceObserver: " . $e->getMessage(), [
                'maintenance_id' => $maintenance->id,
                'item_id' => $item->id,
                'attempted_status' => $newStatus,
            ]);
        }
    }

    /**
     * Handle maintenance completion - return item to available or keep as damaged.
     */
    private function handleCompletion(Maintenance $maintenance): void
    {
        $item = $maintenance->item;

        if (!$item) {
            return;
        }

        // Check if there are any other active maintenance records
        $hasOtherActiveMaintenance = Maintenance::where('item_id', $item->id)
            ->where('id', '!=', $maintenance->id)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->exists();

        // Only update if no other active maintenance exists
        if (!$hasOtherActiveMaintenance) {
            // If maintenance noted damage, keep as damaged; otherwise available
            $newStatus = ($item->condition === 'damaged' || $item->condition === 'poor')
                ? Item::STATUS_DAMAGED
                : Item::STATUS_AVAILABLE;

            $this->updateItemStatus($maintenance, $newStatus);
        }
    }

    /**
     * Handle maintenance cancellation.
     */
    private function handleCancellation(Maintenance $maintenance): void
    {
        $item = $maintenance->item;

        if (!$item) {
            return;
        }

        // Check if there are any other active maintenance records
        $hasOtherActiveMaintenance = Maintenance::where('item_id', $item->id)
            ->where('id', '!=', $maintenance->id)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->exists();

        // Only mark as available if no other active maintenance and not damaged
        if (!$hasOtherActiveMaintenance) {
            if ($item->status === Item::STATUS_UNDER_MAINTENANCE) {
                $this->updateItemStatus($maintenance, Item::STATUS_AVAILABLE);
            }
        }
    }
}
