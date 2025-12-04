<?php

namespace App\Services;

use App\Models\Item;
use InvalidArgumentException;

/**
 * Manages Item state transitions according to ENTITY_LIFECYCLES.md
 *
 * Valid transitions:
 * Create → available
 * available → assigned | in_use | in_maintenance | for_disposal
 * assigned → available (on return) | in_maintenance | damaged | lost
 * in_use → available | in_maintenance | damaged
 * in_maintenance → available | damaged | for_disposal
 * damaged → in_maintenance | for_disposal
 * for_disposal → disposed
 * Any → lost (special case)
 */
class ItemStateMachine
{
    /**
     * Valid state transitions map.
     * Key = current status, Value = array of allowed next statuses
     */
    private const ALLOWED_TRANSITIONS = [
        Item::STATUS_AVAILABLE => [
            Item::STATUS_ASSIGNED,
            Item::STATUS_IN_USE,
            Item::STATUS_UNDER_MAINTENANCE,
            Item::STATUS_PENDING_DISPOSAL,
            Item::STATUS_LOST, // Can be lost from storage
        ],
        Item::STATUS_ASSIGNED => [
            Item::STATUS_AVAILABLE, // When returned
            Item::STATUS_UNDER_MAINTENANCE,
            Item::STATUS_DAMAGED,
            Item::STATUS_LOST,
        ],
        Item::STATUS_IN_USE => [
            Item::STATUS_AVAILABLE,
            Item::STATUS_UNDER_MAINTENANCE,
            Item::STATUS_DAMAGED,
            Item::STATUS_LOST,
        ],
        Item::STATUS_UNDER_MAINTENANCE => [
            Item::STATUS_AVAILABLE, // When repaired
            Item::STATUS_DAMAGED, // If cannot be repaired
            Item::STATUS_PENDING_DISPOSAL, // If beyond repair
        ],
        Item::STATUS_DAMAGED => [
            Item::STATUS_UNDER_MAINTENANCE, // Attempt repair
            Item::STATUS_PENDING_DISPOSAL, // Beyond repair
        ],
        Item::STATUS_PENDING_DISPOSAL => [
            Item::STATUS_DISPOSED, // After approval
            Item::STATUS_AVAILABLE, // If disposal rejected and item is repairable
        ],
        Item::STATUS_DISPOSED => [
            // Terminal state - no transitions out
        ],
        Item::STATUS_LOST => [
            Item::STATUS_AVAILABLE, // If found
            Item::STATUS_DISPOSED, // If declared permanently lost
        ],
    ];

    /**
     * Check if a status transition is allowed.
     *
     * @param string $currentStatus
     * @param string $newStatus
     * @return bool
     */
    public function canTransition(string $currentStatus, string $newStatus): bool
    {
        // Same status is always allowed (no-op)
        if ($currentStatus === $newStatus) {
            return true;
        }

        // Check if transition is in the allowed transitions map
        if (!isset(self::ALLOWED_TRANSITIONS[$currentStatus])) {
            return false;
        }

        return in_array($newStatus, self::ALLOWED_TRANSITIONS[$currentStatus]);
    }

    /**
     * Attempt to transition an item to a new status.
     * Throws exception if transition is not allowed.
     *
     * @param Item $item
     * @param string $newStatus
     * @param string|null $reason Optional reason for the transition
     * @return bool
     * @throws InvalidArgumentException
     */
    public function transition(Item $item, string $newStatus, ?string $reason = null): bool
    {
        $currentStatus = $item->status;

        if (!$this->canTransition($currentStatus, $newStatus)) {
            throw new InvalidArgumentException(
                "Cannot transition item from '{$currentStatus}' to '{$newStatus}'. " .
                $this->getTransitionHint($currentStatus, $newStatus)
            );
        }

        // Perform the transition
        $item->status = $newStatus;

        // Log the transition if reason provided
        if ($reason) {
            activity()
                ->performedOn($item)
                ->withProperties([
                    'old_status' => $currentStatus,
                    'new_status' => $newStatus,
                    'reason' => $reason,
                ])
                ->log("Status changed from {$currentStatus} to {$newStatus}");
        }

        return true;
    }

    /**
     * Get all allowed transitions for a given status.
     *
     * @param string $status
     * @return array
     */
    public function getAllowedTransitions(string $status): array
    {
        return self::ALLOWED_TRANSITIONS[$status] ?? [];
    }

    /**
     * Get a helpful hint about why a transition might be invalid.
     *
     * @param string $currentStatus
     * @param string $newStatus
     * @return string
     */
    private function getTransitionHint(string $currentStatus, string $newStatus): string
    {
        $allowed = $this->getAllowedTransitions($currentStatus);

        if (empty($allowed)) {
            return "Status '{$currentStatus}' is a terminal state.";
        }

        $allowedList = implode(', ', $allowed);
        return "Allowed transitions from '{$currentStatus}': {$allowedList}";
    }

    /**
     * Check if an item can be assigned (is available for assignment).
     *
     * @param Item $item
     * @return bool
     */
    public function canBeAssigned(Item $item): bool
    {
        return in_array($item->status, [
            Item::STATUS_AVAILABLE,
            Item::STATUS_IN_USE,
        ]);
    }

    /**
     * Check if an item can be sent for maintenance.
     *
     * @param Item $item
     * @return bool
     */
    public function canBeMaintained(Item $item): bool
    {
        return in_array($item->status, [
            Item::STATUS_AVAILABLE,
            Item::STATUS_ASSIGNED,
            Item::STATUS_IN_USE,
            Item::STATUS_DAMAGED,
        ]);
    }

    /**
     * Check if an item can be disposed.
     *
     * @param Item $item
     * @return bool
     */
    public function canBeDisposed(Item $item): bool
    {
        return in_array($item->status, [
            Item::STATUS_AVAILABLE,
            Item::STATUS_DAMAGED,
            Item::STATUS_UNDER_MAINTENANCE,
            Item::STATUS_PENDING_DISPOSAL,
        ]);
    }
}
