<?php

namespace App\Services;

use App\Exceptions\RequestException;
use App\Models\Assignment;
use App\Models\Request;
use App\Models\RequestComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Request Service
 *
 * Handles all business logic for the Request/Approval workflow.
 * Follows the lifecycle defined in ENTITY_LIFECYCLES.md Section 6.
 */
class RequestService
{
    public function __construct(
        protected RequestStateMachine $stateMachine
    ) {}

    /**
     * Create a new request.
     *
     * @param array $data
     * @return Request
     * @throws RequestException
     */
    public function createRequest(array $data): Request
    {
        return DB::transaction(function () use ($data) {
            $request = Request::create([
                'user_id' => $data['user_id'] ?? auth()->id(),
                'type' => $data['type'],
                'item_id' => $data['item_id'] ?? null,
                'title' => $data['title'],
                'description' => $data['description'],
                'priority' => $data['priority'] ?? Request::PRIORITY_MEDIUM,
                'status' => Request::STATUS_PENDING,
                'metadata' => $data['metadata'] ?? null,
            ]);

            // Log activity
            activity()
                ->performedOn($request)
                ->causedBy(auth()->user())
                ->withProperties([
                    'type' => $request->type,
                    'priority' => $request->priority,
                    'title' => $request->title,
                ])
                ->log("Created {$request->type} request: {$request->title}");

            return $request->load(['user', 'item']);
        });
    }

    /**
     * Update an existing request.
     *
     * @param Request $request
     * @param array $data
     * @return Request
     * @throws RequestException
     */
    public function updateRequest(Request $request, array $data): Request
    {
        if (!$this->stateMachine->canBeEdited($request)) {
            throw RequestException::cannotUpdate('Request cannot be edited in its current state.');
        }

        return DB::transaction(function () use ($request, $data) {
            $request->update([
                'title' => $data['title'] ?? $request->title,
                'description' => $data['description'] ?? $request->description,
                'priority' => $data['priority'] ?? $request->priority,
                'type' => $data['type'] ?? $request->type,
                'item_id' => $data['item_id'] ?? $request->item_id,
                'metadata' => $data['metadata'] ?? $request->metadata,
            ]);

            activity()
                ->performedOn($request)
                ->causedBy(auth()->user())
                ->withProperties([
                    'title' => $request->title,
                    'changes' => $request->getDirty(),
                ])
                ->log("Updated request: {$request->title}");

            return $request->fresh(['user', 'item', 'reviewer']);
        });
    }

    /**
     * Submit request for review (move from pending to under review).
     *
     * @param Request $request
     * @return Request
     * @throws RequestException
     */
    public function submitForReview(Request $request): Request
    {
        return DB::transaction(function () use ($request) {
            $this->stateMachine->transition($request, Request::STATUS_UNDER_REVIEW);
            $request->save();

            activity()
                ->performedOn($request)
                ->causedBy(auth()->user())
                ->withProperties(['title' => $request->title])
                ->log("Submitted request for review: {$request->title}");

            return $request->fresh(['user', 'item', 'reviewer']);
        });
    }

    /**
     * Approve a request.
     *
     * @param Request $request
     * @param User $reviewer
     * @param array $data
     * @return Request
     * @throws RequestException
     */
    public function approveRequest(Request $request, User $reviewer, array $data = []): Request
    {
        if (!$this->stateMachine->canBeReviewed($request)) {
            throw RequestException::cannotApprove();
        }

        return DB::transaction(function () use ($request, $reviewer, $data) {
            $this->stateMachine->transition($request, Request::STATUS_APPROVED);

            $request->update([
                'status' => Request::STATUS_APPROVED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_notes' => $data['review_notes'] ?? null,
            ]);

            activity()
                ->performedOn($request)
                ->causedBy($reviewer)
                ->withProperties([
                    'title' => $request->title,
                    'review_notes' => $data['review_notes'] ?? null,
                    'reviewer' => $reviewer->name,
                    'auto_executed' => $data['auto_execute'] ?? false,
                ])
                ->log("Approved request: {$request->title}");

            // Auto-execute for assignment requests
            if ($request->type === Request::TYPE_ASSIGNMENT && ($data['auto_execute'] ?? false)) {
                $this->executeRequest($request, $data);
            }

            return $request->fresh(['user', 'item', 'reviewer']);
        });
    }

    /**
     * Reject a request.
     *
     * @param Request $request
     * @param User $reviewer
     * @param array $data
     * @return Request
     * @throws RequestException
     */
    public function rejectRequest(Request $request, User $reviewer, array $data): Request
    {
        if (!$this->stateMachine->canBeReviewed($request)) {
            throw RequestException::cannotReject();
        }

        if (empty($data['review_notes'])) {
            throw RequestException::cannotReject('Rejection reason is required.');
        }

        return DB::transaction(function () use ($request, $reviewer, $data) {
            $this->stateMachine->transition($request, Request::STATUS_REJECTED);

            $request->update([
                'status' => Request::STATUS_REJECTED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_notes' => $data['review_notes'],
            ]);

            activity()
                ->performedOn($request)
                ->causedBy($reviewer)
                ->withProperties([
                    'title' => $request->title,
                    'review_notes' => $data['review_notes'],
                    'reviewer' => $reviewer->name,
                ])
                ->log("Rejected request: {$request->title}");

            return $request->fresh(['user', 'item', 'reviewer']);
        });
    }

    /**
     * Request changes to a request.
     *
     * @param Request $request
     * @param User $reviewer
     * @param array $data
     * @return Request
     * @throws RequestException
     */
    public function requestChanges(Request $request, User $reviewer, array $data): Request
    {
        if (!$this->stateMachine->canBeReviewed($request)) {
            throw RequestException::cannotRequestChanges();
        }

        if (empty($data['review_notes'])) {
            throw RequestException::cannotRequestChanges('Please specify what changes are needed.');
        }

        return DB::transaction(function () use ($request, $reviewer, $data) {
            $this->stateMachine->transition($request, Request::STATUS_CHANGES_REQUESTED);

            $request->update([
                'status' => Request::STATUS_CHANGES_REQUESTED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_notes' => $data['review_notes'],
            ]);

            activity()
                ->performedOn($request)
                ->causedBy($reviewer)
                ->withProperties([
                    'title' => $request->title,
                    'review_notes' => $data['review_notes'],
                    'reviewer' => $reviewer->name,
                ])
                ->log("Requested changes for: {$request->title}");

            return $request->fresh(['user', 'item', 'reviewer']);
        });
    }

    /**
     * Resubmit a request after changes.
     *
     * @param Request $request
     * @return Request
     * @throws RequestException
     */
    public function resubmitRequest(Request $request): Request
    {
        if (!$request->hasChangesRequested()) {
            throw RequestException::cannotUpdate('Only requests with changes requested can be resubmitted.');
        }

        return DB::transaction(function () use ($request) {
            $this->stateMachine->transition($request, Request::STATUS_PENDING);

            $request->update([
                'status' => Request::STATUS_PENDING,
                'reviewed_by' => null,
                'reviewed_at' => null,
                'review_notes' => null,
            ]);

            activity()
                ->performedOn($request)
                ->causedBy(auth()->user())
                ->withProperties(['title' => $request->title])
                ->log("Resubmitted request after changes: {$request->title}");

            return $request->fresh(['user', 'item']);
        });
    }

    /**
     * Execute an approved request (create the actual assignment/action).
     *
     * @param Request $request
     * @param array $data
     * @return Request
     * @throws RequestException
     */
    public function executeRequest(Request $request, array $data = []): Request
    {
        if (!$request->isApproved()) {
            throw RequestException::cannotComplete('Request must be approved before execution.');
        }

        return DB::transaction(function () use ($request, $data) {
            // Execute based on request type
            match ($request->type) {
                Request::TYPE_ASSIGNMENT => $this->executeAssignmentRequest($request, $data),
                Request::TYPE_PURCHASE => $this->executePurchaseRequest($request, $data),
                Request::TYPE_DISPOSAL => $this->executeDisposalRequest($request, $data),
                Request::TYPE_MAINTENANCE => $this->executeMaintenanceRequest($request, $data),
                Request::TYPE_TRANSFER => $this->executeTransferRequest($request, $data),
                default => null,
            };

            $this->stateMachine->transition($request, Request::STATUS_COMPLETED);

            $request->update([
                'status' => Request::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            activity()
                ->performedOn($request)
                ->causedBy(auth()->user())
                ->withProperties([
                    'title' => $request->title,
                    'type' => $request->type,
                    'executed' => true,
                ])
                ->log("Executed and completed request: {$request->title}");

            return $request->fresh(['user', 'item', 'reviewer']);
        });
    }

    /**
     * Cancel a request.
     *
     * @param Request $request
     * @param string|null $reason
     * @return Request
     * @throws RequestException
     */
    public function cancelRequest(Request $request, ?string $reason = null): Request
    {
        if (!$this->stateMachine->canBeCancelled($request)) {
            throw RequestException::cannotCancel();
        }

        return DB::transaction(function () use ($request, $reason) {
            $this->stateMachine->transition($request, Request::STATUS_CANCELLED);

            $request->update([
                'status' => Request::STATUS_CANCELLED,
                'review_notes' => $reason,
            ]);

            activity()
                ->performedOn($request)
                ->causedBy(auth()->user())
                ->withProperties([
                    'title' => $request->title,
                    'reason' => $reason,
                ])
                ->log("Cancelled request: {$request->title}");

            return $request->fresh(['user', 'item', 'reviewer']);
        });
    }

    /**
     * Add a comment to a request.
     *
     * @param Request $request
     * @param User $user
     * @param string $comment
     * @param bool $isInternal
     * @return RequestComment
     */
    public function addComment(Request $request, User $user, string $comment, bool $isInternal = false): RequestComment
    {
        return DB::transaction(function () use ($request, $user, $comment, $isInternal) {
            $requestComment = RequestComment::create([
                'request_id' => $request->id,
                'user_id' => $user->id,
                'comment' => $comment,
                'is_internal' => $isInternal,
            ]);

            activity()
                ->performedOn($request)
                ->causedBy($user)
                ->withProperties([
                    'comment_id' => $requestComment->id,
                    'is_internal' => $isInternal,
                    'title' => $request->title,
                    'commenter' => $user->name,
                ])
                ->log($isInternal
                    ? "Added internal note to request: {$request->title}"
                    : "Added comment to request: {$request->title}");

            return $requestComment->load(['user']);
        });
    }

    /**
     * Get requests with filters.
     *
     * @param array $filters
     * @return Builder
     */
    public function getRequests(array $filters = []): Builder
    {
        $query = Request::query()->with(['user', 'item', 'reviewer']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['reviewed_by'])) {
            $query->where('reviewed_by', $filters['reviewed_by']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->latest();
    }

    /**
     * Get pending requests for review.
     *
     * @return Collection
     */
    public function getPendingRequests(): Collection
    {
        return Request::pending()
            ->with(['user', 'item'])
            ->latest()
            ->get();
    }

    /**
     * Get requests awaiting review (pending + under review).
     *
     * @return Collection
     */
    public function getRequestsAwaitingReview(): Collection
    {
        return Request::whereIn('status', [Request::STATUS_PENDING, Request::STATUS_UNDER_REVIEW])
            ->with(['user', 'item'])
            ->latest()
            ->get();
    }

    /**
     * Get user's requests.
     *
     * @param int $userId
     * @return Collection
     */
    public function getUserRequests(int $userId): Collection
    {
        return Request::forUser($userId)
            ->with(['item', 'reviewer'])
            ->latest()
            ->get();
    }

    /**
     * Get high priority requests.
     *
     * @return Collection
     */
    public function getHighPriorityRequests(): Collection
    {
        return Request::highPriority()
            ->whereIn('status', [Request::STATUS_PENDING, Request::STATUS_UNDER_REVIEW])
            ->with(['user', 'item'])
            ->latest()
            ->get();
    }

    /**
     * Get request statistics.
     *
     * @return array
     */
    public function getRequestStatistics(): array
    {
        return [
            'total' => Request::count(),
            'pending' => Request::pending()->count(),
            'under_review' => Request::underReview()->count(),
            'approved' => Request::approved()->count(),
            'rejected' => Request::rejected()->count(),
            'completed' => Request::completed()->count(),
            'awaiting_review' => Request::whereIn('status', [Request::STATUS_PENDING, Request::STATUS_UNDER_REVIEW])->count(),
            'high_priority' => Request::highPriority()->whereIn('status', [Request::STATUS_PENDING, Request::STATUS_UNDER_REVIEW])->count(),
        ];
    }

    /**
     * Execute assignment request - create actual assignment.
     *
     * @param Request $request
     * @param array $data
     * @return void
     */
    protected function executeAssignmentRequest(Request $request, array $data): void
    {
        if ($request->item_id) {
            $assignment = Assignment::create([
                'item_id' => $request->item_id,
                'user_id' => $request->user_id,
                'assigned_by' => $request->reviewed_by ?? auth()->id(),
                'assigned_date' => now(),
                'due_date' => $data['due_date'] ?? now()->addDays(30),
                'purpose' => $request->title,
                'notes' => $request->description,
                'status' => Assignment::STATUS_ACTIVE,
            ]);

            // Log the assignment creation
            activity()
                ->performedOn($request)
                ->causedBy(auth()->user())
                ->withProperties([
                    'assignment_id' => $assignment->id,
                    'item_id' => $request->item_id,
                    'user_id' => $request->user_id,
                ])
                ->log("Created assignment from request: {$request->title}");
        }
    }

    /**
     * Execute purchase request - placeholder for future implementation.
     *
     * @param Request $request
     * @param array $data
     * @return void
     */
    protected function executePurchaseRequest(Request $request, array $data): void
    {
        // Future implementation: Create purchase order, notify procurement
    }

    /**
     * Execute disposal request - placeholder for future implementation.
     *
     * @param Request $request
     * @param array $data
     * @return void
     */
    protected function executeDisposalRequest(Request $request, array $data): void
    {
        // Future implementation: Create disposal record
    }

    /**
     * Execute maintenance request - placeholder for future implementation.
     *
     * @param Request $request
     * @param array $data
     * @return void
     */
    protected function executeMaintenanceRequest(Request $request, array $data): void
    {
        // Future implementation: Create maintenance record
    }

    /**
     * Execute transfer request - placeholder for future implementation.
     *
     * @param Request $request
     * @param array $data
     * @return void
     */
    protected function executeTransferRequest(Request $request, array $data): void
    {
        // Future implementation: Transfer item to new location/user
    }
}
