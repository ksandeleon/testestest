<?php

namespace App\Http\Controllers;

use App\Exceptions\DisposalException;
use App\Http\Requests\StoreDisposalRequest;
use App\Http\Requests\UpdateDisposalRequest;
use App\Models\Disposal;
use App\Models\Item;
use App\Services\DisposalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisposalController extends Controller
{
    public function __construct(
        protected DisposalService $disposalService
    ) {}

    /**
     * Display a listing of disposals.
     */
    public function index(Request $request): Response
    {
        $this->authorize('disposals.view_any');

        $filters = $request->only(['status', 'reason', 'search', 'date_from', 'date_to']);

        $disposals = $this->disposalService
            ->getDisposals($filters)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('disposals/index', [
            'disposals' => $disposals,
            'filters' => $filters,
            'stats' => $this->disposalService->getDisposalStatistics(),
            'statuses' => Disposal::getStatuses(),
            'reasons' => Disposal::getReasons(),
        ]);
    }

    /**
     * Show the form for creating a new disposal.
     */
    public function create(): Response
    {
        $this->authorize('disposals.create');

        $availableItems = Item::whereIn('status', [
            Item::STATUS_AVAILABLE,
            Item::STATUS_DAMAGED,
        ])
            ->with(['category', 'location'])
            ->get();

        return Inertia::render('disposals/create', [
            'items' => $availableItems,
            'reasons' => Disposal::getReasons(),
            'methods' => Disposal::getMethods(),
        ]);
    }

    /**
     * Store a newly created disposal in storage.
     */
    public function store(StoreDisposalRequest $request): RedirectResponse
    {
        $this->authorize('disposals.create');

        try {
            $disposal = $this->disposalService->createDisposal($request->validated());

            return redirect()
                ->route('disposals.show', $disposal)
                ->with('success', 'Disposal request created successfully.');
        } catch (\Exception $e) {
            return back()
                ->with('error', $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified disposal.
     */
    public function show(Disposal $disposal): Response
    {
        $this->authorize('disposals.view');

        $disposal = $this->disposalService->getDisposalById($disposal->id);

        return Inertia::render('disposals/show', [
            'disposal' => $disposal,
            'methods' => Disposal::getMethods(),
        ]);
    }

    /**
     * Show the form for editing the specified disposal.
     */
    public function edit(Disposal $disposal): Response
    {
        $this->authorize('disposals.update');

        if (!$disposal->isPending()) {
            return redirect()
                ->route('disposals.show', $disposal)
                ->with('error', 'Only pending disposals can be edited.');
        }

        return Inertia::render('disposals/edit', [
            'disposal' => $disposal->load(['item', 'requestedBy']),
            'reasons' => Disposal::getReasons(),
            'methods' => Disposal::getMethods(),
        ]);
    }

    /**
     * Update the specified disposal in storage.
     */
    public function update(UpdateDisposalRequest $request, Disposal $disposal): RedirectResponse
    {
        $this->authorize('disposals.update');

        if (!$disposal->isPending()) {
            return back()->with('error', 'Only pending disposals can be updated.');
        }

        try {
            $disposal->update($request->validated());

            return redirect()
                ->route('disposals.show', $disposal)
                ->with('success', 'Disposal request updated successfully.');
        } catch (\Exception $e) {
            return back()
                ->with('error', $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified disposal from storage.
     */
    public function destroy(Disposal $disposal): RedirectResponse
    {
        $this->authorize('disposals.delete');

        try {
            $this->disposalService->cancelDisposal($disposal);

            return redirect()
                ->route('disposals.index')
                ->with('success', 'Disposal request cancelled successfully.');
        } catch (DisposalException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display pending disposals.
     */
    public function pending(): Response
    {
        $this->authorize('disposals.view_any');

        $disposals = $this->disposalService->getPendingDisposals();

        return Inertia::render('disposals/pending', [
            'disposals' => $disposals,
        ]);
    }

    /**
     * Show the approval form.
     */
    public function showApprovalForm(Disposal $disposal): Response
    {
        $this->authorize('disposals.approve');

        if (!$disposal->isPending()) {
            return redirect()
                ->route('disposals.show', $disposal)
                ->with('error', 'This disposal has already been processed.');
        }

        return Inertia::render('disposals/approve', [
            'disposal' => $disposal->load(['item', 'requestedBy']),
            'methods' => Disposal::getMethods(),
        ]);
    }

    /**
     * Approve a disposal request.
     */
    public function approve(Request $request, Disposal $disposal): RedirectResponse
    {
        $this->authorize('disposals.approve');

        $request->validate([
            'approval_notes' => 'nullable|string',
            'disposal_method' => 'nullable|string|in:' . implode(',', Disposal::getMethods()),
            'scheduled_for' => 'nullable|date|after:today',
        ]);

        try {
            $this->disposalService->approveDisposal($disposal, $request->all());

            return redirect()
                ->route('disposals.show', $disposal)
                ->with('success', 'Disposal request approved successfully.');
        } catch (DisposalException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject a disposal request.
     */
    public function reject(Request $request, Disposal $disposal): RedirectResponse
    {
        $this->authorize('disposals.reject');

        $request->validate([
            'approval_notes' => 'required|string',
        ]);

        try {
            $this->disposalService->rejectDisposal($disposal, $request->all());

            return redirect()
                ->route('disposals.show', $disposal)
                ->with('success', 'Disposal request rejected.');
        } catch (DisposalException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show the execution form.
     */
    public function showExecutionForm(Disposal $disposal): Response
    {
        $this->authorize('disposals.execute');

        if (!$disposal->isApproved()) {
            return redirect()
                ->route('disposals.show', $disposal)
                ->with('error', 'Only approved disposals can be executed.');
        }

        return Inertia::render('disposals/execute', [
            'disposal' => $disposal->load(['item', 'requestedBy', 'approvedBy']),
            'methods' => Disposal::getMethods(),
        ]);
    }

    /**
     * Execute a disposal.
     */
    public function execute(Request $request, Disposal $disposal): RedirectResponse
    {
        $this->authorize('disposals.execute');

        $request->validate([
            'execution_notes' => 'nullable|string',
            'disposal_cost' => 'nullable|numeric|min:0',
            'disposal_method' => 'required|string|in:' . implode(',', Disposal::getMethods()),
            'recipient' => 'nullable|string',
        ]);

        try {
            $this->disposalService->executeDisposal($disposal, $request->all());

            return redirect()
                ->route('disposals.show', $disposal)
                ->with('success', 'Disposal executed successfully.');
        } catch (DisposalException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Export disposals to Excel.
     */
    public function export(Request $request): mixed
    {
        $this->authorize('disposals.view_any');

        // TODO: Implement export functionality
        return back()->with('info', 'Export functionality coming soon.');
    }
}
