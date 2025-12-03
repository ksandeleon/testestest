<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Item;
use App\Models\User;
use App\Services\AssignmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function __construct(
        protected AssignmentService $assignmentService
    ) {}

    /**
     * Display a listing of assignments.
     */
    public function index(Request $request): Response
    {
        $this->authorize('assignments.view_any');

        $query = Assignment::with(['item', 'user', 'assignedBy']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by item
        if ($request->filled('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('item', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('property_number', 'like', "%{$search}%");
            })->orWhereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $assignments = $query->latest()->paginate(15);

        return Inertia::render('assignments/index', [
            'assignments' => $assignments,
            'filters' => $request->only(['status', 'user_id', 'item_id', 'search']),
            'stats' => $this->assignmentService->getAssignmentSummary(),
        ]);
    }

    /**
     * Display assignments for the authenticated user (staff view).
     */
    public function myAssignments(): Response
    {
        $this->authorize('assignments.view_own');

        $user = auth()->user();

        $assignments = Assignment::with(['item.category', 'item.location', 'assignedBy'])
            ->where('user_id', $user->id)
            ->whereIn('status', [Assignment::STATUS_PENDING, Assignment::STATUS_APPROVED, Assignment::STATUS_ACTIVE])
            ->latest()
            ->get();

        $stats = $this->assignmentService->getUserAssignmentStats($user->id);

        return Inertia::render('assignments/my-assignments', [
            'assignments' => $assignments,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new assignment.
     */
    public function create(): Response
    {
        $this->authorize('assignments.create');

        $authUser = auth()->user();
        if (!$authUser) {
            abort(401);
        }

        // Get available items (not currently assigned)
        $items = Item::with(['category', 'location'])
            ->whereDoesntHave('currentAssignment')
            ->where('status', 'available')
            ->get();

        $users = User::where('id', '!=', $authUser->id)
            ->get(['id', 'name', 'email']);

        return Inertia::render('assignments/create', [
            'items' => $items,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created assignment.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('assignments.create');

        $authUser = auth()->user();
        if (!$authUser) {
            abort(401);
        }

        $validated = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'user_id' => ['required', 'exists:users,id'],
            'assigned_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after:assigned_date'],
            'purpose' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
            'condition_on_assignment' => ['nullable', 'in:good,fair,poor,excellent'],
        ]);

        try {
            $assignment = $this->assignmentService->createAssignment([
                ...$validated,
                'assigned_by' => $authUser->id,
            ]);

            return redirect()->route('assignments.show', $assignment)
                ->with('success', 'Assignment created successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()
                ->withInput()
                ->withErrors(['item_id' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified assignment.
     */
    public function show(Assignment $assignment): Response
    {
        $this->authorize('assignments.view');

        $assignment->load(['item', 'user', 'assignedBy', 'return']);

        return Inertia::render('assignments/show', [
            'assignment' => $assignment,
        ]);
    }

    /**
     * Show the form for editing the specified assignment.
     */
    public function edit(Assignment $assignment): Response
    {
        $this->authorize('assignments.update');

        $assignment->load(['item', 'user']);

        return Inertia::render('assignments/edit', [
            'assignment' => $assignment,
        ]);
    }

    /**
     * Update the specified assignment.
     */
    public function update(Request $request, Assignment $assignment): RedirectResponse
    {
        $this->authorize('assignments.update');

        $validated = $request->validate([
            'due_date' => ['nullable', 'date'],
            'purpose' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->assignmentService->updateAssignment($assignment, $validated);

        return redirect()->route('assignments.show', $assignment)
            ->with('success', 'Assignment updated successfully.');
    }

    /**
     * Cancel the specified assignment.
     */
    public function cancel(Assignment $assignment): RedirectResponse
    {
        $this->authorize('assignments.update');

        if ($assignment->status === Assignment::STATUS_RETURNED) {
            return back()->withErrors(['error' => 'Cannot cancel a returned assignment.']);
        }

        $this->assignmentService->cancelAssignment($assignment);

        return redirect()->route('assignments.index')
            ->with('success', 'Assignment cancelled successfully.');
    }

    /**
     * Approve a pending assignment.
     */
    public function approve(Assignment $assignment): RedirectResponse
    {
        $this->authorize('assignments.approve');

        try {
            $this->assignmentService->approveAssignment($assignment);

            return back()->with('success', 'Assignment approved successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject a pending assignment.
     */
    public function reject(Assignment $assignment): RedirectResponse
    {
        $this->authorize('assignments.reject');

        $this->assignmentService->cancelAssignment($assignment);

        return back()->with('success', 'Assignment rejected.');
    }

    /**
     * Get overdue assignments.
     */
    public function overdue(): Response
    {
        $this->authorize('assignments.view_any');

        $assignments = Assignment::overdue()
            ->with(['item', 'user', 'assignedBy'])
            ->latest()
            ->paginate(15);

        return Inertia::render('assignments/overdue', [
            'assignments' => $assignments,
        ]);
    }

    /**
     * Bulk assign items to a user.
     */
    public function bulkAssign(Request $request): RedirectResponse
    {
        $this->authorize('assignments.create');

        $authUser = auth()->user();
        if (!$authUser) {
            abort(401);
        }

        $validated = $request->validate([
            'item_ids' => ['required', 'array'],
            'item_ids.*' => ['exists:items,id'],
            'user_id' => ['required', 'exists:users,id'],
            'assigned_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after:assigned_date'],
            'purpose' => ['nullable', 'string', 'max:1000'],
        ]);

        $assignments = $this->assignmentService->bulkAssign(
            $validated['item_ids'],
            $validated['user_id'],
            $authUser->id,
            [
                'assigned_date' => $validated['assigned_date'],
                'due_date' => $validated['due_date'] ?? null,
                'purpose' => $validated['purpose'] ?? null,
            ]
        );

        return redirect()->route('assignments.index')
            ->with('success', "Successfully assigned {$assignments->count()} items.");
    }

    /**
     * Export assignments.
     */
    public function export(): RedirectResponse
    {
        $this->authorize('assignments.export');

        // Export logic will be implemented later
        return back()->with('info', 'Export functionality coming soon.');
    }
}
