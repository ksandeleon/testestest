<?php

namespace App\Services;

use App\Exceptions\RequestException;
use App\Models\Request;

/**
 * Request State Machine
 *
 * Manages valid state transitions for requests according to the lifecycle:
 * Pending → Under Review → [Approved/Rejected/Changes Requested]
 * Approved → Completed
 * Changes Requested → Pending (on resubmit)
 */
class RequestStateMachine
{
    /**
     * Valid state transitions map.
     *
     * @var array<string, array<string>>
     */
    private const VALID_TRANSITIONS = [
        Request::STATUS_PENDING => [
            Request::STATUS_UNDER_REVIEW,
            Request::STATUS_APPROVED,
            Request::STATUS_REJECTED,
            Request::STATUS_CHANGES_REQUESTED,
            Request::STATUS_CANCELLED,
        ],
        Request::STATUS_UNDER_REVIEW => [
            Request::STATUS_APPROVED,
            Request::STATUS_REJECTED,
            Request::STATUS_CHANGES_REQUESTED,
            Request::STATUS_CANCELLED,
            Request::STATUS_PENDING, // Can go back to pending
        ],
        Request::STATUS_CHANGES_REQUESTED => [
            Request::STATUS_PENDING, // User resubmits
            Request::STATUS_CANCELLED,
        ],
        Request::STATUS_APPROVED => [
            Request::STATUS_COMPLETED,
            Request::STATUS_CANCELLED, // Can cancel even after approval
        ],
        Request::STATUS_REJECTED => [
            // Terminal state - no transitions
        ],
        Request::STATUS_COMPLETED => [
            // Terminal state - no transitions
        ],
        Request::STATUS_CANCELLED => [
            // Terminal state - no transitions
        ],
    ];

    /**
     * Check if a status transition is valid.
     *
     * @param string $fromStatus
     * @param string $toStatus
     * @return bool
     */
    public function canTransition(string $fromStatus, string $toStatus): bool
    {
        if (!isset(self::VALID_TRANSITIONS[$fromStatus])) {
            return false;
        }

        return in_array($toStatus, self::VALID_TRANSITIONS[$fromStatus]);
    }

    /**
     * Validate and perform a status transition.
     *
     * @param Request $request
     * @param string $toStatus
     * @return Request
     * @throws RequestException
     */
    public function transition(Request $request, string $toStatus): Request
    {
        if (!$this->canTransition($request->status, $toStatus)) {
            throw RequestException::invalidStatusTransition($request->status, $toStatus);
        }

        $request->status = $toStatus;

        return $request;
    }

    /**
     * Get all possible next states for a given status.
     *
     * @param string $fromStatus
     * @return array<string>
     */
    public function getNextStates(string $fromStatus): array
    {
        return self::VALID_TRANSITIONS[$fromStatus] ?? [];
    }

    /**
     * Check if a request can be reviewed (approved/rejected/changes requested).
     *
     * @param Request $request
     * @return bool
     */
    public function canBeReviewed(Request $request): bool
    {
        return in_array($request->status, [
            Request::STATUS_PENDING,
            Request::STATUS_UNDER_REVIEW,
            Request::STATUS_CHANGES_REQUESTED,
        ]);
    }

    /**
     * Check if a request can be edited by the requester.
     *
     * @param Request $request
     * @return bool
     */
    public function canBeEdited(Request $request): bool
    {
        return in_array($request->status, [
            Request::STATUS_PENDING,
            Request::STATUS_CHANGES_REQUESTED,
        ]);
    }

    /**
     * Check if a request can be cancelled.
     *
     * @param Request $request
     * @return bool
     */
    public function canBeCancelled(Request $request): bool
    {
        return !in_array($request->status, [
            Request::STATUS_COMPLETED,
            Request::STATUS_CANCELLED,
            Request::STATUS_REJECTED,
        ]);
    }

    /**
     * Check if a request can be completed.
     *
     * @param Request $request
     * @return bool
     */
    public function canBeCompleted(Request $request): bool
    {
        return $request->status === Request::STATUS_APPROVED;
    }

    /**
     * Check if a request is in a terminal state.
     *
     * @param Request $request
     * @return bool
     */
    public function isTerminal(Request $request): bool
    {
        return in_array($request->status, [
            Request::STATUS_COMPLETED,
            Request::STATUS_CANCELLED,
            Request::STATUS_REJECTED,
        ]);
    }

    /**
     * Get transition reason/requirement.
     *
     * @param string $fromStatus
     * @param string $toStatus
     * @return string
     */
    public function getTransitionReason(string $fromStatus, string $toStatus): string
    {
        if (!$this->canTransition($fromStatus, $toStatus)) {
            return "Cannot transition from {$fromStatus} to {$toStatus}";
        }

        return match ($toStatus) {
            Request::STATUS_UNDER_REVIEW => 'Request is being reviewed',
            Request::STATUS_APPROVED => 'Request has been approved',
            Request::STATUS_REJECTED => 'Request has been rejected',
            Request::STATUS_CHANGES_REQUESTED => 'Changes have been requested',
            Request::STATUS_COMPLETED => 'Request action has been completed',
            Request::STATUS_CANCELLED => 'Request has been cancelled',
            Request::STATUS_PENDING => 'Request is pending review',
            default => 'Status changed',
        };
    }
}
