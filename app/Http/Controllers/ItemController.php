<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use App\Models\User;
use App\Services\ItemService;
use App\Services\ItemStateMachine;
use App\Services\QrCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    protected ItemService $itemService;
    protected QrCodeService $qrCodeService;
    protected ItemStateMachine $stateMachine;

    public function __construct(
        ItemService $itemService,
        QrCodeService $qrCodeService,
        ItemStateMachine $stateMachine
    ) {
        $this->itemService = $itemService;
        $this->qrCodeService = $qrCodeService;
        $this->stateMachine = $stateMachine;
    }

    /**
     * Display a listing of items.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Staff users can only view their assigned items
        if ($user->hasRole('staff')) {
            return $this->staffItemsView($request);
        }

        $this->authorize('items.view_any');

        $query = Item::with(['category', 'location', 'accountablePerson'])
            ->latest();

        // Apply filters
        $this->applyFilters($query, $request);

        $items = $query->paginate(15)->withQueryString();

        return Inertia::render('items/index', [
            'items' => $items,
            'categories' => Category::active()->get(['id', 'name']),
            'locations' => Location::active()->get(['id', 'name']),
            'filters' => $request->only(['search', 'category', 'location', 'status', 'condition']),
        ]);
    }

    /**
     * Show the form for creating a new item.
     */
    public function create(): Response
    {
        $this->authorize('items.create');

        return Inertia::render('items/create', [
            'categories' => Category::active()->get(['id', 'name', 'code']),
            'locations' => Location::active()->get(['id', 'name', 'code']),
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Store a newly created item.
     */
    public function store(StoreItemRequest $request): RedirectResponse
    {
        try {
            $this->itemService->create($request->validated(), generateQr: true);

            return redirect()->route('items.index')
                ->with('success', 'Item created successfully.');
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', 'Failed to create item: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified item.
     */
    public function show(Item $item): Response
    {
        $this->authorize('items.view', $item);

        $item->load([
            'category',
            'location',
            'accountablePerson',
            'assignments' => fn ($q) => $q->latest()->limit(5),
            'maintenances' => fn ($q) => $q->latest()->limit(5),
        ]);

        return Inertia::render('items/show', [
            'item' => $item,
            'canAssign' => $this->stateMachine->canBeAssigned($item),
            'canMaintain' => $this->stateMachine->canBeMaintained($item),
            'canDispose' => $this->stateMachine->canBeDisposed($item),
        ]);
    }

    /**
     * Show the form for editing the item.
     */
    public function edit(Item $item): Response
    {
        $this->authorize('items.update', $item);

        return Inertia::render('items/edit', [
            'item' => $item->load(['category', 'location']),
            'categories' => Category::active()->get(['id', 'name', 'code']),
            'locations' => Location::active()->get(['id', 'name', 'code']),
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the specified item.
     */
    public function update(UpdateItemRequest $request, Item $item): RedirectResponse
    {
        try {
            $this->itemService->update($item, $request->validated());

            return redirect()->route('items.index')
                ->with('success', 'Item updated successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->withInput()
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', 'Failed to update item: ' . $e->getMessage());
        }
    }

    /**
     * Soft delete the specified item.
     */
    public function destroy(Item $item): RedirectResponse
    {
        $this->authorize('items.delete', $item);

        try {
            $this->itemService->delete($item, force: false);

            return redirect()->route('items.index')
                ->with('success', 'Item deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Restore a soft-deleted item.
     */
    public function restore(int $id): RedirectResponse
    {
        $this->authorize('items.restore');

        $item = Item::onlyTrashed()->findOrFail($id);
        $this->itemService->restore($item);

        return redirect()->route('items.index')
            ->with('success', 'Item restored successfully.');
    }

    /**
     * Permanently delete an item.
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $this->authorize('items.force_delete');

        $item = Item::withTrashed()->findOrFail($id);

        try {
            $this->itemService->delete($item, force: true);

            return redirect()->route('items.index')
                ->with('success', 'Item permanently deleted.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Generate or regenerate QR code for an item.
     */
    public function generateQr(Item $item): RedirectResponse
    {
        $this->authorize('items.generate_qr');

        try {
            $this->itemService->generateQrCode($item, regenerate: true);

            return back()->with('success', 'QR code generated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to generate QR code: ' . $e->getMessage());
        }
    }

    /**
     * Display QR code for printing.
     */
    public function printQr(Item $item): Response
    {
        $this->authorize('items.view', $item);

        return Inertia::render('items/print-qr', [
            'item' => $item,
            'qrCodeUrl' => $this->qrCodeService->getUrl($item->qr_code_path),
        ]);
    }

    /**
     * View item activity history.
     */
    public function history(Item $item): Response
    {
        $this->authorize('items.view', $item);

        $activities = $item->activities()
            ->with('causer')
            ->latest()
            ->paginate(20);

        return Inertia::render('items/history', [
            'item' => $item,
            'activities' => $activities,
        ]);
    }

    /**
     * Bulk update items.
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $this->authorize('items.bulk_update');

        $validated = $request->validate([
            'item_ids' => ['required', 'array'],
            'item_ids.*' => ['exists:items,id'],
            'action' => ['required', 'in:update_status,update_location,update_category'],
            'value' => ['required'],
        ]);

        try {
            $items = Item::whereIn('id', $validated['item_ids'])->get();

            foreach ($items as $item) {
                match ($validated['action']) {
                    'update_status' => $this->itemService->changeStatus($item, $validated['value'], 'Bulk status update'),
                    'update_location' => $item->update(['location_id' => $validated['value']]),
                    'update_category' => $item->update(['category_id' => $validated['value']]),
                };
            }

            return back()->with('success', 'Items updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Bulk update failed: ' . $e->getMessage());
        }
    }

    /**
     * Export items data.
     */
    public function export(Request $request): RedirectResponse
    {
        $this->authorize('items.export');

        // TODO: Implement export functionality with maatwebsite/excel
        return back()->with('info', 'Export functionality coming soon.');
    }

    /**
     * Import items from file.
     */
    public function import(Request $request): RedirectResponse
    {
        $this->authorize('items.import');

        // TODO: Implement import functionality with maatwebsite/excel
        return back()->with('info', 'Import functionality coming soon.');
    }

    /**
     * Staff user's view of their assigned items.
     */
    private function staffItemsView(Request $request): Response
    {
        $user = Auth::user();

        $query = Item::with(['category', 'location'])
            ->where('accountable_person_id', $user->id)
            ->latest();

        // Apply filters
        $this->applyFilters($query, $request);

        $items = $query->paginate(15)->withQueryString();

        return Inertia::render('items/my-items', [
            'items' => $items,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Apply common filters to the query.
     */
    private function applyFilters($query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('property_number', 'like', "%{$search}%")
                    ->orWhere('iar_number', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('location')) {
            $query->where('location_id', $request->location);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }
    }
}
