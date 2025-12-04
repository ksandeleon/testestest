<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Category;
use App\Models\Location;
use App\Models\User;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
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

        // Search
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

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by location
        if ($request->filled('location')) {
            $query->where('location_id', $request->location);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by condition
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

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
     * Store a newly created item in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('items.create');

        $validated = $request->validate([
            'iar_number' => ['required', 'string', 'max:255', 'unique:items'],
            'property_number' => ['required', 'string', 'max:255', 'unique:items'],
            'fund_cluster' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'specifications' => ['nullable', 'string'],
            'acquisition_cost' => ['required', 'numeric', 'min:0'],
            'unit_of_measure' => ['nullable', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'category_id' => ['required', 'exists:categories,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'accountable_person_id' => ['nullable', 'exists:users,id'],
            'accountable_person_name' => ['nullable', 'string', 'max:255'],
            'accountable_person_position' => ['nullable', 'string', 'max:255'],
            'date_acquired' => ['required', 'date'],
            'date_inventoried' => ['nullable', 'date'],
            'estimated_useful_life' => ['nullable', 'date'],
            'status' => ['required', 'in:available,assigned,in_use,in_maintenance,for_disposal,disposed,lost,damaged'],
            'condition' => ['required', 'in:excellent,good,fair,poor,for_repair,unserviceable'],
            'remarks' => ['nullable', 'string'],
        ]);

        $validated['created_by'] = Auth::id();

        $item = Item::create($validated);

        return redirect()->route('items.show', $item)
            ->with('success', 'Item created successfully.');
    }

    /**
     * Display the specified item.
     */
    public function show(Item $item): Response
    {
        $this->authorize('items.view');

        $item->load([
            'category',
            'location',
            'accountablePerson',
            'creator',
            'updater',
        ]);

        return Inertia::render('items/show', [
            'item' => $item,
        ]);
    }

    /**
     * Show the form for editing the specified item.
     */
    public function edit(Item $item): Response
    {
        $this->authorize('items.update');

        return Inertia::render('items/edit', [
            'item' => $item->load(['category', 'location', 'accountablePerson']),
            'categories' => Category::active()->get(['id', 'name', 'code']),
            'locations' => Location::active()->get(['id', 'name', 'code']),
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the specified item in storage.
     */
    public function update(Request $request, Item $item): RedirectResponse
    {
        $this->authorize('items.update');

        $validated = $request->validate([
            'iar_number' => ['required', 'string', 'max:255', 'unique:items,iar_number,' . $item->id],
            'property_number' => ['required', 'string', 'max:255', 'unique:items,property_number,' . $item->id],
            'fund_cluster' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'specifications' => ['nullable', 'string'],
            'acquisition_cost' => ['required', 'numeric', 'min:0'],
            'unit_of_measure' => ['nullable', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'category_id' => ['required', 'exists:categories,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'accountable_person_id' => ['nullable', 'exists:users,id'],
            'accountable_person_name' => ['nullable', 'string', 'max:255'],
            'accountable_person_position' => ['nullable', 'string', 'max:255'],
            'date_acquired' => ['required', 'date'],
            'date_inventoried' => ['nullable', 'date'],
            'estimated_useful_life' => ['nullable', 'date'],
            'status' => ['required', 'in:available,assigned,in_use,in_maintenance,for_disposal,disposed,lost,damaged'],
            'condition' => ['required', 'in:excellent,good,fair,poor,for_repair,unserviceable'],
            'remarks' => ['nullable', 'string'],
        ]);

        $validated['updated_by'] = Auth::id();

        $item->update($validated);

        return redirect()->route('items.show', $item)
            ->with('success', 'Item updated successfully.');
    }

    /**
     * Remove the specified item from storage (soft delete).
     */
    public function destroy(Item $item): RedirectResponse
    {
        $this->authorize('items.delete');

        $item->delete();

        return redirect()->route('items.index')
            ->with('success', 'Item deleted successfully.');
    }

    /**
     * Restore the specified soft-deleted item.
     */
    public function restore(int $id): RedirectResponse
    {
        $this->authorize('items.restore');

        $item = Item::withTrashed()->findOrFail($id);
        $item->restore();

        return redirect()->route('items.show', $item)
            ->with('success', 'Item restored successfully.');
    }

    /**
     * Permanently delete the specified item.
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $this->authorize('items.force_delete');

        $item = Item::withTrashed()->findOrFail($id);
        $item->forceDelete();

        return redirect()->route('items.index')
            ->with('success', 'Item permanently deleted.');
    }

    /**
     * Generate QR code for the specified item.
     */
    public function generateQr(Item $item): RedirectResponse
    {
        $this->authorize('items.generate_qr');

        // Generate unique QR code if not exists
        if (!$item->qr_code) {
            $qrCode = 'EARIST-' . strtoupper($item->property_number ?? uniqid());

            // Create QR code data - JSON with item details
            $qrData = json_encode([
                'item_id' => $item->id,
                'property_number' => $item->property_number,
                'iar_number' => $item->iar_number,
                'name' => $item->name,
                'qr_code' => $qrCode,
                'url' => route('items.show', $item),
            ]);

            // Generate QR code image
            $builder = new Builder(
                writer: new PngWriter(),
                writerOptions: [],
                validateResult: false,
                data: $qrData,
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::High,
                size: 300,
                margin: 10,
            );

            $result = $builder->build();

            // Save QR code image to storage
            $filename = 'qr-codes/' . $qrCode . '.png';
            Storage::disk('public')->put($filename, $result->getString());

            // Update item with QR code info
            $item->update([
                'qr_code' => $qrCode,
                'qr_code_path' => $filename,
                'updated_by' => Auth::id(),
            ]);
        }

        return back()->with('success', 'QR code generated successfully.');
    }

    /**
     * Print QR code for the specified item.
     */
    public function printQr(Item $item): Response
    {
        $this->authorize('items.print_qr');

        return Inertia::render('items/print-qr', [
            'item' => $item->load(['category', 'location', 'accountablePerson']),
        ]);
    }

    /**
     * View item history.
     */
    public function history(Item $item): Response
    {
        $this->authorize('items.view_history');

        // This will be extended when we add assignment/maintenance/disposal tracking
        return Inertia::render('items/history', [
            'item' => $item->load(['category', 'location', 'accountablePerson', 'creator', 'updater']),
        ]);
    }

    /**
     * Update item cost.
     */
    public function updateCost(Request $request, Item $item): RedirectResponse
    {
        $this->authorize('items.update_cost');

        $validated = $request->validate([
            'acquisition_cost' => ['required', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string'],
        ]);

        $item->update([
            'acquisition_cost' => $validated['acquisition_cost'],
            'remarks' => $validated['remarks'] ?? $item->remarks,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Item cost updated successfully.');
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
            'action' => ['required', 'in:update_status,update_condition,update_location,delete'],
            'status' => ['required_if:action,update_status', 'in:available,assigned,in_use,in_maintenance,for_disposal,disposed,lost,damaged'],
            'condition' => ['required_if:action,update_condition', 'in:excellent,good,fair,poor,for_repair,unserviceable'],
            'location_id' => ['required_if:action,update_location', 'exists:locations,id'],
        ]);

        $items = Item::whereIn('id', $validated['item_ids']);

        switch ($validated['action']) {
            case 'update_status':
                $items->update([
                    'status' => $validated['status'],
                    'updated_by' => Auth::id(),
                ]);
                $message = 'Items status updated successfully.';
                break;

            case 'update_condition':
                $items->update([
                    'condition' => $validated['condition'],
                    'updated_by' => Auth::id(),
                ]);
                $message = 'Items condition updated successfully.';
                break;

            case 'update_location':
                $items->update([
                    'location_id' => $validated['location_id'],
                    'updated_by' => Auth::id(),
                ]);
                $message = 'Items location updated successfully.';
                break;

            case 'delete':
                $items->delete();
                $message = 'Items deleted successfully.';
                break;

            default:
                return back()->with('error', 'Invalid action.');
        }

        return back()->with('success', $message);
    }

    /**
     * Export items data.
     */
    public function export(Request $request): RedirectResponse
    {
        $this->authorize('items.export');

        // Export logic will be implemented when needed (CSV, Excel, PDF)

        return back()->with('info', 'Export functionality coming soon.');
    }

    /**
     * Import items data.
     */
    public function import(Request $request): RedirectResponse
    {
        $this->authorize('items.import');

        // Import logic will be implemented when needed (CSV, Excel)

        return back()->with('info', 'Import functionality coming soon.');
    }

    /**
     * Staff-specific view of their assigned items.
     */
    private function staffItemsView(Request $request): Response
    {
        $user = Auth::user();

        $query = $user->assignedItems()
            ->with(['category', 'location', 'currentAssignment']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('property_number', 'like', "%{$search}%");
            });
        }

        $items = $query->paginate(15)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);
        $locations = Location::orderBy('name')->get(['id', 'name']);

        return Inertia::render('items/my-items', [
            'items' => $items,
            'categories' => $categories,
            'locations' => $locations,
            'filters' => $request->only(['search']),
        ]);
    }
}
