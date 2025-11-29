<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Maintenance;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('maintenance.view_any');

        $query = Maintenance::with(['item', 'assignedTo', 'requestedBy'])
            ->latest();

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by maintenance type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('maintenance_type', $request->type);
        }

        // Filter by priority
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('item', function($itemQuery) use ($search) {
                      $itemQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('property_number', 'like', "%{$search}%");
                  });
            });
        }

        $maintenances = $query->paginate(15)->withQueryString();

        return Inertia::render('maintenance/index', [
            'maintenances' => $maintenances,
            'filters' => $request->only(['status', 'type', 'priority', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('maintenance.create');

        $items = Item::select('id', 'name', 'property_number', 'brand', 'model', 'status')
            ->whereNotIn('status', ['disposed', 'lost'])
            ->orderBy('name')
            ->get();

        $technicians = User::permission('maintenance.assign')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('maintenance/create', [
            'items' => $items,
            'technicians' => $technicians,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('maintenance.create');

        $validated = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'maintenance_type' => ['required', 'in:preventive,corrective,predictive,emergency'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'issue_reported' => ['nullable', 'string'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'scheduled_date' => ['nullable', 'date'],
            'estimated_duration' => ['nullable', 'integer', 'min:1'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['requested_by'] = auth()->id();
        $validated['created_by'] = auth()->id();

        // If scheduled date is provided, set status to scheduled
        if (isset($validated['scheduled_date'])) {
            $validated['status'] = 'scheduled';
        }

        $maintenance = Maintenance::create($validated);

        return redirect()
            ->route('maintenance.show', $maintenance)
            ->with('success', 'Maintenance request created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Maintenance $maintenance)
    {
        $this->authorize('maintenance.view');

        $maintenance->load([
            'item.category',
            'item.location',
            'assignedTo',
            'requestedBy',
            'approvedBy',
            'creator',
            'updater'
        ]);

        return Inertia::render('maintenance/show', [
            'maintenance' => $maintenance,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Maintenance $maintenance)
    {
        $this->authorize('maintenance.update');

        $maintenance->load(['item', 'assignedTo']);

        $items = Item::select('id', 'name', 'property_number', 'brand', 'model', 'status')
            ->whereNotIn('status', ['disposed', 'lost'])
            ->orderBy('name')
            ->get();

        $technicians = User::permission('maintenance.assign')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('maintenance/edit', [
            'maintenance' => $maintenance,
            'items' => $items,
            'technicians' => $technicians,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Maintenance $maintenance)
    {
        $this->authorize('maintenance.update');

        $validated = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'maintenance_type' => ['required', 'in:preventive,corrective,predictive,emergency'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'issue_reported' => ['nullable', 'string'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'scheduled_date' => ['nullable', 'date'],
            'estimated_duration' => ['nullable', 'integer', 'min:1'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['updated_by'] = auth()->id();

        $maintenance->update($validated);

        return back()->with('success', 'Maintenance updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Maintenance $maintenance)
    {
        $this->authorize('maintenance.delete');

        $maintenance->delete();

        return redirect()
            ->route('maintenance.index')
            ->with('success', 'Maintenance deleted successfully.');
    }

    /**
     * Schedule maintenance for a specific date.
     */
    public function schedule(Request $request, Maintenance $maintenance)
    {
        $this->authorize('maintenance.schedule');

        $validated = $request->validate([
            'scheduled_date' => ['required', 'date', 'after:now'],
            'estimated_duration' => ['nullable', 'integer', 'min:1'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $maintenance->scheduleMaintenance(
            new \DateTime($validated['scheduled_date']),
            $validated['estimated_duration'] ?? null
        );

        if (isset($validated['assigned_to'])) {
            $user = User::find($validated['assigned_to']);
            $maintenance->assignTo($user);
        }

        return back()->with('success', 'Maintenance scheduled successfully.');
    }

    /**
     * Mark maintenance as started.
     */
    public function start(Maintenance $maintenance)
    {
        $this->authorize('maintenance.update');

        if ($maintenance->status === 'completed') {
            return back()->with('error', 'Cannot start a completed maintenance.');
        }

        $maintenance->markAsStarted();

        return back()->with('success', 'Maintenance started successfully.');
    }

    /**
     * Mark maintenance as completed.
     */
    public function complete(Request $request, Maintenance $maintenance)
    {
        $this->authorize('maintenance.complete');

        $validated = $request->validate([
            'action_taken' => ['required', 'string'],
            'actual_cost' => ['nullable', 'numeric', 'min:0'],
            'recommendations' => ['nullable', 'string'],
            'item_condition_after' => ['required', 'in:excellent,good,fair,poor,for_repair,unserviceable'],
            'item_status_after' => ['required', 'in:available,assigned,in_use,in_maintenance,for_disposal,disposed,lost,damaged'],
        ]);

        $maintenance->markAsCompleted($validated);

        return back()->with('success', 'Maintenance completed successfully.');
    }

    /**
     * Assign maintenance to a technician.
     */
    public function assign(Request $request, Maintenance $maintenance)
    {
        $this->authorize('maintenance.assign');

        $validated = $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $user = User::find($validated['assigned_to']);
        $maintenance->assignTo($user);

        return back()->with('success', 'Maintenance assigned successfully.');
    }

    /**
     * Approve maintenance cost.
     */
    public function approveCost(Maintenance $maintenance)
    {
        $this->authorize('maintenance.approve_cost');

        $maintenance->update([
            'cost_approved' => true,
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Maintenance cost approved successfully.');
    }

    /**
     * Display calendar view of maintenance.
     */
    public function calendar(Request $request)
    {
        $this->authorize('maintenance.view_any');

        $start = $request->filled('start') ? $request->start : now()->startOfMonth();
        $end = $request->filled('end') ? $request->end : now()->endOfMonth();

        $maintenances = Maintenance::with(['item', 'assignedTo'])
            ->whereBetween('scheduled_date', [$start, $end])
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->get()
            ->map(function($maintenance) {
                return [
                    'id' => $maintenance->id,
                    'title' => $maintenance->title,
                    'start' => $maintenance->scheduled_date,
                    'backgroundColor' => $this->getEventColor($maintenance->priority),
                    'borderColor' => $this->getEventColor($maintenance->priority),
                    'extendedProps' => [
                        'item' => $maintenance->item->name,
                        'property_number' => $maintenance->item->property_number,
                        'status' => $maintenance->status,
                        'priority' => $maintenance->priority,
                        'assigned_to' => $maintenance->assignedTo?->name,
                    ],
                ];
            });

        return Inertia::render('maintenance/calendar', [
            'maintenances' => $maintenances,
        ]);
    }

    /**
     * Export maintenance records.
     */
    public function export(Request $request)
    {
        // TODO: Implement export functionality (CSV/Excel)
        return back()->with('info', 'Export functionality coming soon.');
    }

    /**
     * Get event color based on priority.
     */
    private function getEventColor(string $priority): string
    {
        return match($priority) {
            'low' => '#6B7280',
            'medium' => '#3B82F6',
            'high' => '#F59E0B',
            'critical' => '#EF4444',
            default => '#6B7280',
        };
    }
}
