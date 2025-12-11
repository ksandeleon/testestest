<?php

namespace App\Http\Controllers;

use App\Exceptions\RequestException;
use App\Http\Requests\ReviewRequestRequest;
use App\Http\Requests\StoreRequestRequest;
use App\Http\Requests\UpdateRequestRequest;
use App\Models\Item;
use App\Models\Request;
use App\Services\RequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;
use Inertia\Response;

class RequestController extends Controller
{
    public function __construct(
        protected RequestService $requestService
    ) {}

    /**
     * Display a listing of requests.
     */
    public function index(HttpRequest $request): Response
    {
        $this->authorize('requests.view_any');

        $filters = $request->only(['status', 'type', 'priority', 'user_id', 'reviewed_by', 'search', 'date_from', 'date_to']);

        $requests = $this->requestService
            ->getRequests($filters)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('requests/index', [
            'requests' => $requests,
            'filters' => $filters,
            'statistics' => $this->requestService->getRequestStatistics(),
            'types' => Request::getTypes(),
            'statuses' => Request::getStatuses(),
            'priorities' => Request::getPriorities(),
        ]);
    }

    /**
     * Display requests created by the authenticated user.
     */
    public function myRequests(HttpRequest $request): Response
    {
        $this->authorize('requests.view');

        $filters = $request->only(['status', 'type', 'priority', 'search']);

        $requests = \App\Models\Request::query()
            ->where('user_id', auth()->id())
            ->with(['user', 'reviewer', 'item.category'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($filters['priority'] ?? null, fn ($query, $priority) => $query->where('priority', $priority))
            ->when($filters['search'] ?? null, fn ($query, $search) =>
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                })
            )
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        // Add computed properties
        $requests->getCollection()->transform(function ($request) {
            $request->can_edit = $request->canBeEdited();
            $request->can_cancel = $request->canBeCancelled();
            return $request;
        });

        return Inertia::render('requests/my-requests', [
            'requests' => $requests,
            'filters' => $filters,
        ]);
    }

    /**
     * Display requests awaiting review/approval.
     */
    public function pendingApprovals(HttpRequest $request): Response
    {
        $this->authorize('requests.approve');

        $filters = $request->only(['type', 'priority', 'search']);

        $requests = \App\Models\Request::query()
            ->whereIn('status', ['pending', 'under_review'])
            ->with(['user', 'item.category'])
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($filters['priority'] ?? null, fn ($query, $priority) => $query->where('priority', $priority))
            ->when($filters['search'] ?? null, fn ($query, $search) =>
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"));
                })
            )
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        $statistics = [
            'total_pending' => \App\Models\Request::whereIn('status', ['pending', 'under_review'])->count(),
            'high_priority' => \App\Models\Request::whereIn('status', ['pending', 'under_review'])->where('priority', 'high')->count(),
            'urgent' => \App\Models\Request::whereIn('status', ['pending', 'under_review'])->where('priority', 'urgent')->count(),
        ];

        return Inertia::render('requests/pending-approvals', [
            'requests' => $requests,
            'filters' => $filters,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new request.
     */
    public function create(): Response
    {
        $this->authorize('requests.create');

        $availableItems = Item::whereIn('status', [
            Item::STATUS_AVAILABLE,
            Item::STATUS_UNDER_MAINTENANCE,
        ])
            ->with(['category', 'location'])
            ->get();

        return Inertia::render('requests/create', [
            'available_items' => $availableItems,
        ]);
    }

    /**
     * Store a newly created request in storage.
     */
    public function store(StoreRequestRequest $request): RedirectResponse
    {
        try {
            $requestModel = $this->requestService->createRequest($request->validated());

            return redirect()
                ->route('requests.show', $requestModel)
                ->with('success', 'Request created successfully. It will be reviewed soon.');
        } catch (RequestException $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified request.
     */
    public function show(Request $request): Response
    {
        $this->authorize('requests.view');

        // Users can only view their own requests unless they have view_any permission
        if ($request->user_id !== auth()->id() && !auth()->user()->can('requests.view_any')) {
            abort(403, 'You are not authorized to view this request.');
        }

        return Inertia::render('requests/show', [
            'request' => $request->load(['user', 'item', 'reviewer', 'comments.user']),
            'can_add_internal_notes' => auth()->user()->can('requests.approve'),
        ]);
    }

    /**
     * Show the form for editing the specified request.
     */
    public function edit(Request $request): Response
    {
        $this->authorize('requests.update');

        if (!$request->canBeEdited()) {
            return redirect()
                ->route('requests.show', $request)
                ->with('error', 'This request cannot be edited in its current state.');
        }

        if ($request->user_id !== auth()->id() && !auth()->user()->can('requests.update')) {
            abort(403, 'You are not authorized to edit this request.');
        }

        $availableItems = Item::whereIn('status', [
            Item::STATUS_AVAILABLE,
            Item::STATUS_UNDER_MAINTENANCE,
        ])
            ->with(['category', 'location'])
            ->get();

        return Inertia::render('requests/edit', [
            'request' => $request->load(['user', 'item']),
            'available_items' => $availableItems,
        ]);
    }

    /**
     * Update the specified request in storage.
     */
    public function update(UpdateRequestRequest $request, Request $requestModel): RedirectResponse
    {
        try {
            $this->requestService->updateRequest($requestModel, $request->validated());

            return redirect()
                ->route('requests.show', $requestModel)
                ->with('success', 'Request updated successfully.');
        } catch (RequestException $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified request from storage.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $this->authorize('requests.delete');

        // Only allow deletion of pending or changes_requested requests
        if (!in_array($request->status, [Request::STATUS_PENDING, Request::STATUS_CHANGES_REQUESTED, Request::STATUS_CANCELLED])) {
            return back()->with('error', 'Only pending, cancelled, or requests with changes requested can be deleted.');
        }

        $request->delete();

        return redirect()
            ->route('requests.index')
            ->with('success', 'Request deleted successfully.');
    }

    /**
     * Submit request for review.
     */
    public function submitForReview(Request $request): RedirectResponse
    {
        try {
            $this->requestService->submitForReview($request);

            return redirect()
                ->route('requests.show', $request)
                ->with('success', 'Request submitted for review.');
        } catch (RequestException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show review form for a request.
     */
    public function review(Request $request): Response
    {
        $this->authorize('requests.approve');

        if (!$request->canBeReviewed()) {
            return redirect()
                ->route('requests.show', $request)
                ->with('error', 'This request is not in a reviewable state.');
        }

        return Inertia::render('requests/review', [
            'request' => $request->load(['user', 'item', 'comments.user']),
        ]);
    }

    /**
     * Approve a request.
     */
    public function approve(ReviewRequestRequest $request, Request $requestModel): RedirectResponse
    {
        try {
            $this->requestService->approveRequest(
                $requestModel,
                auth()->user(),
                $request->validated()
            );

            return redirect()
                ->route('requests.show', $requestModel)
                ->with('success', 'Request approved successfully.');
        } catch (RequestException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject a request.
     */
    public function reject(ReviewRequestRequest $request, Request $requestModel): RedirectResponse
    {
        try {
            $this->requestService->rejectRequest(
                $requestModel,
                auth()->user(),
                $request->validated()
            );

            return redirect()
                ->route('requests.show', $requestModel)
                ->with('success', 'Request rejected.');
        } catch (RequestException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Request changes to a request.
     */
    public function requestChanges(ReviewRequestRequest $request, Request $requestModel): RedirectResponse
    {
        try {
            $this->requestService->requestChanges(
                $requestModel,
                auth()->user(),
                $request->validated()
            );

            return redirect()
                ->route('requests.show', $requestModel)
                ->with('success', 'Changes requested. The user has been notified.');
        } catch (RequestException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Resubmit a request after making requested changes.
     */
    public function resubmit(Request $request): RedirectResponse
    {
        try {
            $this->requestService->resubmitRequest($request);

            return redirect()
                ->route('requests.show', $request)
                ->with('success', 'Request resubmitted for review.');
        } catch (RequestException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Execute an approved request.
     */
    public function execute(HttpRequest $httpRequest, Request $request): RedirectResponse
    {
        $this->authorize('requests.approve');

        try {
            $this->requestService->executeRequest($request, $httpRequest->all());

            return redirect()
                ->route('requests.show', $request)
                ->with('success', 'Request executed successfully.');
        } catch (RequestException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel a request.
     */
    public function cancel(HttpRequest $httpRequest, Request $request): RedirectResponse
    {
        try {
            $this->requestService->cancelRequest($request, $httpRequest->input('reason'));

            return redirect()
                ->route('requests.show', $request)
                ->with('success', 'Request cancelled.');
        } catch (RequestException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Add a comment to a request.
     */
    public function addComment(HttpRequest $httpRequest, Request $request): RedirectResponse
    {
        $httpRequest->validate([
            'comment' => ['required', 'string', 'max:2000'],
            'is_internal' => ['nullable', 'boolean'],
        ]);

        $this->requestService->addComment(
            $request,
            auth()->user(),
            $httpRequest->input('comment'),
            $httpRequest->boolean('is_internal', false)
        );

        return back()->with('success', 'Comment added successfully.');
    }
}
