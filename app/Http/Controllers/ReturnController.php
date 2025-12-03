<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\ItemReturn;
use App\Services\ReturnService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function __construct(
        protected ReturnService $returnService
    ) {}

    /**
     * Display a listing of returns.
     */
    public function index(Request $request): Response
    {
        $this->authorize('returns.view_any');

        $query = ItemReturn::with(['assignment.item', 'assignment.user', 'returnedBy', 'inspectedBy']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter damaged
        if ($request->filled('is_damaged')) {
            $query->where('is_damaged', $request->boolean('is_damaged'));
        }

        // Filter late
        if ($request->filled('is_late')) {
            $query->where('is_late', $request->boolean('is_late'));
        }

        $returns = $query->latest()->paginate(15);

        return Inertia::render('returns/index', [
            'returns' => $returns,
            'filters' => $request->only(['status', 'is_damaged', 'is_late']),
            'stats' => $this->returnService->getReturnStatistics(),
        ]);
    }

    /**
     * Display returns for the authenticated user.
     */
    public function myReturns(): Response
    {
        $this->authorize('returns.view');

        $user = auth()->user();
        $returns = $this->returnService->getUserReturns($user->id);

        return Inertia::render('returns/my-returns', [
            'returns' => $returns,
        ]);
    }

    /**
     * Show the form for creating a new return (return an assignment).
     */
    public function create(Request $request): Response
    {
        $this->authorize('returns.create');

        // Get assignment ID from query parameter
        $assignmentId = $request->query('assignment_id');

        $assignment = null;
        if ($assignmentId) {
            $assignment = Assignment::with(['item', 'user'])
                ->where('status', Assignment::STATUS_ACTIVE)
                ->findOrFail($assignmentId);
        }

        // Get all active assignments that can be returned
        $activeAssignments = Assignment::with(['item', 'user'])
            ->where('status', Assignment::STATUS_ACTIVE)
            ->latest()
            ->get();

        return Inertia::render('returns/create', [
            'assignment' => $assignment,
            'activeAssignments' => $activeAssignments,
            'conditions' => ItemReturn::CONDITIONS,
        ]);
    }

    /**
     * Store a newly created return.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('returns.create');

        $validated = $request->validate([
            'assignment_id' => ['required', 'exists:assignments,id'],
            'condition_on_return' => ['required', 'in:good,fair,poor,damaged'],
            'is_damaged' => ['boolean'],
            'damage_description' => ['required_if:is_damaged,true', 'nullable', 'string', 'max:2000'],
            'damage_images' => ['nullable', 'array'],
            'return_notes' => ['nullable', 'string', 'max:2000'],
            'return_date' => ['nullable', 'date'],
        ]);

        $assignment = Assignment::findOrFail($validated['assignment_id']);

        try {
            $return = $this->returnService->createReturn($assignment, [
                ...$validated,
                'returned_by' => auth()->user()->id,
            ]);

            return redirect()->route('returns.show', $return)
                ->with('success', 'Return submitted successfully. Pending inspection.');
        } catch (\InvalidArgumentException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified return.
     */
    public function show(ItemReturn $return): Response
    {
        $this->authorize('returns.view');

        $return->load(['assignment.item', 'assignment.user', 'returnedBy', 'inspectedBy']);

        return Inertia::render('returns/show', [
            'return' => $return,
        ]);
    }

    /**
     * Show pending inspections.
     */
    public function pendingInspections(): Response
    {
        $this->authorize('returns.inspect');

        $returns = $this->returnService->getPendingInspections();

        return Inertia::render('returns/pending-inspections', [
            'returns' => $returns,
        ]);
    }

    /**
     * Show the inspection form.
     */
    public function inspect(ItemReturn $return): Response
    {
        $this->authorize('returns.inspect');

        if (!$return->isPendingInspection()) {
            return Inertia::render('returns/show', [
                'return' => $return->load(['assignment.item', 'assignment.user']),
            ])->with('error', 'This return has already been inspected.');
        }

        $return->load(['assignment.item', 'assignment.user', 'returnedBy']);

        return Inertia::render('returns/inspect', [
            'return' => $return,
            'conditions' => ItemReturn::CONDITIONS,
        ]);
    }

    /**
     * Process the inspection.
     */
    public function processInspection(Request $request, ItemReturn $return): RedirectResponse
    {
        $this->authorize('returns.inspect');

        $validated = $request->validate([
            'inspection_notes' => ['nullable', 'string', 'max:2000'],
            'is_damaged' => ['boolean'],
            'damage_description' => ['required_if:is_damaged,true', 'nullable', 'string', 'max:2000'],
            'item_condition' => ['required', 'in:good,fair,poor,damaged'],
        ]);

        try {
            $this->returnService->inspectReturn(
                $return,
                auth()->user(),
                $validated
            );

            return redirect()->route('returns.show', $return)
                ->with('success', 'Inspection completed successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Approve a return.
     */
    public function approve(ItemReturn $return): RedirectResponse
    {
        $this->authorize('returns.approve_condition');

        try {
            $this->returnService->approveReturn($return);

            return back()->with('success', 'Return approved successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject a return.
     */
    public function reject(Request $request, ItemReturn $return): RedirectResponse
    {
        $this->authorize('returns.approve_condition');

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $this->returnService->rejectReturn($return, $validated['reason']);

        return back()->with('success', 'Return rejected.');
    }

    /**
     * View damaged returns.
     */
    public function damaged(): Response
    {
        $this->authorize('returns.view_any');

        $returns = $this->returnService->getDamagedReturns();

        return Inertia::render('returns/damaged', [
            'returns' => $returns,
        ]);
    }

    /**
     * View late returns.
     */
    public function late(): Response
    {
        $this->authorize('returns.view_any');

        $returns = $this->returnService->getLateReturns();

        return Inertia::render('returns/late', [
            'returns' => $returns,
        ]);
    }

    /**
     * Quick return - simplified return process.
     */
    public function quickReturn(Request $request, Assignment $assignment): RedirectResponse
    {
        $this->authorize('returns.create');

        $validated = $request->validate([
            'condition' => ['required', 'in:good,fair,poor,damaged'],
        ]);

        try {
            $return = $this->returnService->quickReturn(
                $assignment,
                auth()->user(),
                $validated['condition']
            );

            return redirect()->route('returns.show', $return)
                ->with('success', 'Item returned successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Calculate and update penalty.
     */
    public function calculatePenalty(ItemReturn $return): RedirectResponse
    {
        $this->authorize('returns.update');

        $penalty = $this->returnService->calculatePenalty($return);

        return back()->with('success', "Penalty calculated: $" . number_format($penalty, 2));
    }

    /**
     * Mark penalty as paid.
     */
    public function markPenaltyPaid(ItemReturn $return): RedirectResponse
    {
        $this->authorize('returns.update');

        $this->returnService->markPenaltyAsPaid($return);

        return back()->with('success', 'Penalty marked as paid.');
    }
}
