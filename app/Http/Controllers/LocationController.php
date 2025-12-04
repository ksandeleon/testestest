<?php

namespace App\Http\Controllers;

use App\Exceptions\LocationException;
use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Services\LocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function __construct(
        private readonly LocationService $locationService
    ) {
    }

    /**
     * Display a listing of locations.
     */
    public function index(Request $request): Response
    {
        $this->authorize('locations.view_any');

        $filters = [
            'search' => $request->get('search'),
            'building' => $request->get('building'),
            'floor' => $request->get('floor'),
            'is_active' => $request->get('is_active'),
            'with_trashed' => $request->get('with_trashed'),
        ];

        $locations = $this->locationService->getLocations(
            $filters,
            $request->get('per_page', 15)
        );

        $statistics = $this->locationService->getLocationStatistics();
        $buildings = $this->locationService->getBuildings();

        return Inertia::render('locations/index', [
            'locations' => $locations,
            'statistics' => $statistics,
            'buildings' => $buildings->toArray(),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new location.
     */
    public function create(): Response
    {
        $this->authorize('locations.create');

        $buildings = $this->locationService->getBuildings();

        return Inertia::render('locations/create', [
            'buildings' => $buildings->toArray(),
        ]);
    }

    /**
     * Store a newly created location.
     */
    public function store(StoreLocationRequest $request): RedirectResponse
    {
        try {
            $location = $this->locationService->createLocation($request->validated());

            return redirect()
                ->route('locations.index')
                ->with('success', "Location '{$location->name}' created successfully.");
        } catch (LocationException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified location.
     */
    public function show(int $id): Response
    {
        $this->authorize('locations.view');

        try {
            $location = $this->locationService->getLocationById($id);
            $location->load(['items' => function ($query) {
                $query->with(['category', 'location'])->latest()->limit(10);
            }]);

            return Inertia::render('locations/show', [
                'location' => $location,
            ]);
        } catch (LocationException $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified location.
     */
    public function edit(int $id): Response
    {
        $this->authorize('locations.update');

        try {
            $location = $this->locationService->getLocationById($id);
            $buildings = $this->locationService->getBuildings();

            return Inertia::render('locations/edit', [
                'location' => $location,
                'buildings' => $buildings->toArray(),
            ]);
        } catch (LocationException $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Update the specified location.
     */
    public function update(UpdateLocationRequest $request, int $id): RedirectResponse
    {
        try {
            $location = $this->locationService->updateLocation($id, $request->validated());

            return redirect()
                ->route('locations.index')
                ->with('success', "Location '{$location->name}' updated successfully.");
        } catch (LocationException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified location (soft delete).
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->authorize('locations.delete');

        try {
            $location = $this->locationService->getLocationById($id);
            $locationName = $location->name;

            $this->locationService->deleteLocation($id);

            return redirect()
                ->route('locations.index')
                ->with('success', "Location '{$locationName}' deleted successfully.");
        } catch (LocationException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Toggle location active status.
     */
    public function toggleStatus(int $id): RedirectResponse
    {
        $this->authorize('locations.update');

        try {
            $location = $this->locationService->toggleActiveStatus($id);
            $status = $location->is_active ? 'activated' : 'deactivated';

            return back()
                ->with('success', "Location '{$location->name}' {$status} successfully.");
        } catch (LocationException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Restore a soft-deleted location.
     */
    public function restore(int $id): RedirectResponse
    {
        $this->authorize('locations.delete');

        try {
            $location = $this->locationService->restoreLocation($id);

            return redirect()
                ->route('locations.index')
                ->with('success', "Location '{$location->name}' restored successfully.");
        } catch (LocationException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Permanently delete a location.
     */
    public function forceDestroy(int $id): RedirectResponse
    {
        $this->authorize('locations.delete');

        try {
            $location = $this->locationService->getLocationById($id, withTrashed: true);
            $locationName = $location->name;

            $this->locationService->forceDeleteLocation($id);

            return redirect()
                ->route('locations.index')
                ->with('success', "Location '{$locationName}' permanently deleted.");
        } catch (LocationException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Show form to reassign items.
     */
    public function reassignForm(int $id): Response
    {
        $this->authorize('locations.update');

        try {
            $location = $this->locationService->getLocationById($id);
            $location->loadCount('items');

            $otherLocations = $this->locationService->getActiveLocations()
                ->where('id', '!=', $id);

            return Inertia::render('locations/reassign', [
                'location' => $location,
                'locations' => $otherLocations,
            ]);
        } catch (LocationException $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Reassign items from one location to another.
     */
    public function reassignItems(Request $request, int $id): RedirectResponse
    {
        $this->authorize('locations.update');

        $request->validate([
            'to_location_id' => ['required', 'exists:locations,id', 'different:id'],
        ]);

        try {
            $count = $this->locationService->reassignItems($id, $request->to_location_id);

            $fromLocation = $this->locationService->getLocationById($id);
            $toLocation = $this->locationService->getLocationById($request->to_location_id);

            return redirect()
                ->route('locations.index')
                ->with('success', "{$count} items reassigned from '{$fromLocation->name}' to '{$toLocation->name}'.");
        } catch (LocationException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }
}
