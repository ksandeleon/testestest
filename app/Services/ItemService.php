<?php

namespace App\Services;

use App\Models\Item;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ItemService
{
    protected QrCodeService $qrCodeService;
    protected ItemStateMachine $stateMachine;

    public function __construct(QrCodeService $qrCodeService, ItemStateMachine $stateMachine)
    {
        $this->qrCodeService = $qrCodeService;
        $this->stateMachine = $stateMachine;
    }

    /**
     * Create a new item with QR code generation.
     *
     * @param array $data
     * @param bool $generateQr
     * @return Item
     * @throws \Exception
     */
    public function create(array $data, bool $generateQr = true): Item
    {
        return DB::transaction(function () use ($data, $generateQr) {
            // Set default status if not provided
            if (!isset($data['status'])) {
                $data['status'] = Item::STATUS_AVAILABLE;
            }

            // Create the item
            $item = Item::create($data);

            // Generate QR code if requested
            if ($generateQr) {
                $qrCodePath = $this->qrCodeService->generate($item);
                $item->update(['qr_code_path' => $qrCodePath]);
            }

            activity()
                ->performedOn($item)
                ->log('Item created');

            return $item->fresh();
        });
    }

    /**
     * Update an existing item.
     *
     * @param Item $item
     * @param array $data
     * @return Item
     */
    public function update(Item $item, array $data): Item
    {
        return DB::transaction(function () use ($item, $data) {
            // Track status change if it exists
            $oldStatus = $item->status;
            $newStatus = $data['status'] ?? $oldStatus;

            // Validate status transition if status is being changed
            if ($oldStatus !== $newStatus) {
                $this->stateMachine->transition($item, $newStatus, 'Manual status update');
            }

            $item->update($data);

            activity()
                ->performedOn($item)
                ->withProperties([
                    'old_status' => $oldStatus,
                    'new_status' => $item->status,
                ])
                ->log('Item updated');

            return $item->fresh();
        });
    }

    /**
     * Delete an item and its QR code.
     *
     * @param Item $item
     * @param bool $force Force delete (permanent)
     * @return bool
     * @throws \Exception
     */
    public function delete(Item $item, bool $force = false): bool
    {
        return DB::transaction(function () use ($item, $force) {
            // Check if item can be deleted (not assigned, not in maintenance, etc.)
            if ($item->currentAssignment()->exists()) {
                throw new \Exception("Cannot delete item that is currently assigned.");
            }

            if ($item->activeMaintenance()->exists()) {
                throw new \Exception("Cannot delete item that is currently under maintenance.");
            }

            // Delete QR code
            $this->qrCodeService->delete($item->qr_code_path);

            activity()
                ->performedOn($item)
                ->log($force ? 'Item permanently deleted' : 'Item soft deleted');

            // Perform deletion
            if ($force) {
                return $item->forceDelete();
            } else {
                return $item->delete();
            }
        });
    }

    /**
     * Restore a soft-deleted item.
     *
     * @param Item $item
     * @return bool
     */
    public function restore(Item $item): bool
    {
        $restored = $item->restore();

        if ($restored) {
            activity()
                ->performedOn($item)
                ->log('Item restored');
        }

        return $restored;
    }

    /**
     * Generate or regenerate QR code for an item.
     *
     * @param Item $item
     * @param bool $regenerate Force regeneration even if QR exists
     * @return Item
     * @throws \Exception
     */
    public function generateQrCode(Item $item, bool $regenerate = false): Item
    {
        return DB::transaction(function () use ($item, $regenerate) {
            if ($regenerate || !$item->qr_code_path) {
                $qrCodePath = $this->qrCodeService->regenerate($item);
                $item->update(['qr_code_path' => $qrCodePath]);

                activity()
                    ->performedOn($item)
                    ->log('QR code ' . ($regenerate ? 'regenerated' : 'generated'));
            }

            return $item->fresh();
        });
    }

    /**
     * Change item status with validation.
     *
     * @param Item $item
     * @param string $newStatus
     * @param string|null $reason
     * @return Item
     * @throws \InvalidArgumentException
     */
    public function changeStatus(Item $item, string $newStatus, ?string $reason = null): Item
    {
        return DB::transaction(function () use ($item, $newStatus, $reason) {
            // Validate the transition
            $this->stateMachine->transition($item, $newStatus, $reason);

            // Save the item
            $item->save();

            return $item->fresh();
        });
    }

    /**
     * Bulk import items.
     *
     * @param array $itemsData Array of item data
     * @param bool $generateQr Generate QR codes for all items
     * @return Collection
     */
    public function bulkCreate(array $itemsData, bool $generateQr = true): Collection
    {
        $items = new Collection();

        DB::transaction(function () use ($itemsData, $generateQr, &$items) {
            foreach ($itemsData as $data) {
                $items->push($this->create($data, $generateQr));
            }
        });

        return $items;
    }

    /**
     * Get items that need maintenance (based on last maintenance date or condition).
     *
     * @return Collection
     */
    public function getItemsNeedingMaintenance(): Collection
    {
        return Item::where('status', Item::STATUS_DAMAGED)
            ->orWhere(function ($query) {
                $query->where('status', Item::STATUS_AVAILABLE)
                    ->whereNotNull('last_maintenance_date')
                    ->whereRaw('last_maintenance_date < DATE_SUB(NOW(), INTERVAL 6 MONTH)');
            })
            ->get();
    }

    /**
     * Get items pending disposal.
     *
     * @return Collection
     */
    public function getItemsPendingDisposal(): Collection
    {
        return Item::where('status', Item::STATUS_PENDING_DISPOSAL)->get();
    }

    /**
     * Mark item as lost.
     *
     * @param Item $item
     * @param string|null $reason
     * @return Item
     */
    public function markAsLost(Item $item, ?string $reason = null): Item
    {
        return $this->changeStatus($item, Item::STATUS_LOST, $reason ?? 'Item marked as lost');
    }

    /**
     * Mark item as found (from lost status).
     *
     * @param Item $item
     * @return Item
     */
    public function markAsFound(Item $item): Item
    {
        if ($item->status !== Item::STATUS_LOST) {
            throw new \InvalidArgumentException("Only lost items can be marked as found.");
        }

        return $this->changeStatus($item, Item::STATUS_AVAILABLE, 'Item found and returned to inventory');
    }

    /**
     * Check if item can be assigned.
     *
     * @param Item $item
     * @return bool
     */
    public function canBeAssigned(Item $item): bool
    {
        return $this->stateMachine->canBeAssigned($item);
    }

    /**
     * Check if item can be sent for maintenance.
     *
     * @param Item $item
     * @return bool
     */
    public function canBeMaintained(Item $item): bool
    {
        return $this->stateMachine->canBeMaintained($item);
    }

    /**
     * Check if item can be disposed.
     *
     * @param Item $item
     * @return bool
     */
    public function canBeDisposed(Item $item): bool
    {
        return $this->stateMachine->canBeDisposed($item);
    }
}
