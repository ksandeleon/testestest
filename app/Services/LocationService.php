<?php

namespace App\Services;

use App\Exceptions\LocationException;
use App\Models\Location;
use App\Models\Item;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class LocationService
{
    /**
     * Get paginated list of locations with optional filters.
     */
    public function getLocations(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Location::query()->withCount('items');

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('building', 'like', "%{$search}%")
                    ->orWhere('room', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Building filter
        if (!empty($filters['building'])) {
            $query->where('building', $filters['building']);
        }

        // Floor filter
        if (!empty($filters['floor'])) {
            $query->where('floor', $filters['floor']);
        }

        // Active/Inactive filter
        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Include trashed
        if (!empty($filters['with_trashed'])) {
            $query->withTrashed();
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Get all active locations.
     */
    public function getActiveLocations(): Collection
    {
        return Location::active()->orderBy('name')->get();
    }

    /**
     * Get location by ID.
     */
    public function getLocationById(int $id, bool $withTrashed = false): Location
    {
        $query = Location::withCount('items');

        if ($withTrashed) {
            $query->withTrashed();
        }

        $location = $query->find($id);

        if (!$location) {
            throw LocationException::notFound($id);
        }

        return $location;
    }

    /**
     * Create a new location.
     */
    public function createLocation(array $data): Location
    {
        // Check if code already exists
        if (Location::where('code', $data['code'])->exists()) {
            throw LocationException::codeExists($data['code']);
        }

        return DB::transaction(function () use ($data) {
            $location = Location::create([
                'name' => $data['name'],
                'code' => strtoupper($data['code']),
                'building' => $data['building'] ?? null,
                'floor' => $data['floor'] ?? null,
                'room' => $data['room'] ?? null,
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            activity()
                ->performedOn($location)
                ->log('Location created');

            return $location;
        });
    }

    /**
     * Update an existing location.
     */
    public function updateLocation(int $id, array $data): Location
    {
        $location = $this->getLocationById($id);

        // Check if code already exists (excluding current location)
        if (isset($data['code']) &&
            Location::where('code', $data['code'])
                ->where('id', '!=', $id)
                ->exists()) {
            throw LocationException::codeExists($data['code']);
        }

        return DB::transaction(function () use ($location, $data) {
            $oldAttributes = $location->getAttributes();

            $location->update([
                'name' => $data['name'] ?? $location->name,
                'code' => isset($data['code']) ? strtoupper($data['code']) : $location->code,
                'building' => $data['building'] ?? $location->building,
                'floor' => $data['floor'] ?? $location->floor,
                'room' => $data['room'] ?? $location->room,
                'description' => $data['description'] ?? $location->description,
                'is_active' => $data['is_active'] ?? $location->is_active,
            ]);

            activity()
                ->performedOn($location)
                ->withProperties([
                    'old' => $oldAttributes,
                    'new' => $location->getAttributes(),
                ])
                ->log('Location updated');

            return $location->fresh();
        });
    }

    /**
     * Toggle location active status.
     */
    public function toggleActiveStatus(int $id): Location
    {
        $location = $this->getLocationById($id);

        // If trying to deactivate, check for active items
        if ($location->is_active && $this->hasActiveItems($location)) {
            throw LocationException::cannotDeactivate($location->name);
        }

        return DB::transaction(function () use ($location) {
            $newStatus = !$location->is_active;
            $location->update(['is_active' => $newStatus]);

            activity()
                ->performedOn($location)
                ->log($newStatus ? 'Location activated' : 'Location deactivated');

            return $location->fresh();
        });
    }

    /**
     * Soft delete a location.
     */
    public function deleteLocation(int $id): bool
    {
        $location = $this->getLocationById($id);

        // Check if location has items
        if ($location->items()->exists()) {
            throw LocationException::hasItems($location->name);
        }

        return DB::transaction(function () use ($location) {
            activity()
                ->performedOn($location)
                ->log('Location deleted');

            return $location->delete();
        });
    }

    /**
     * Restore a soft-deleted location.
     */
    public function restoreLocation(int $id): Location
    {
        $location = $this->getLocationById($id, withTrashed: true);

        if (!$location->trashed()) {
            throw new LocationException("Location '{$location->name}' is not deleted.");
        }

        DB::transaction(function () use ($location) {
            $location->restore();

            activity()
                ->performedOn($location)
                ->log('Location restored');
        });

        return $location->fresh();
    }

    /**
     * Force delete a location permanently.
     */
    public function forceDeleteLocation(int $id): bool
    {
        $location = $this->getLocationById($id, withTrashed: true);

        // Check if location has items (including soft-deleted items)
        if ($location->items()->withTrashed()->exists()) {
            throw LocationException::hasItems($location->name);
        }

        return DB::transaction(function () use ($location) {
            activity()
                ->performedOn($location)
                ->log('Location permanently deleted');

            return $location->forceDelete();
        });
    }

    /**
     * Reassign items from one location to another.
     */
    public function reassignItems(int $fromLocationId, int $toLocationId): int
    {
        $fromLocation = $this->getLocationById($fromLocationId);
        $toLocation = $this->getLocationById($toLocationId);

        return DB::transaction(function () use ($fromLocation, $toLocation) {
            $count = $fromLocation->items()->update(['location_id' => $toLocation->id]);

            activity()
                ->performedOn($fromLocation)
                ->withProperties([
                    'to_location' => $toLocation->name,
                    'items_count' => $count,
                ])
                ->log('Items reassigned to another location');

            return $count;
        });
    }

    /**
     * Get location statistics.
     */
    public function getLocationStatistics(): array
    {
        return [
            'total' => Location::count(),
            'active' => Location::active()->count(),
            'inactive' => Location::where('is_active', false)->count(),
            'deleted' => Location::onlyTrashed()->count(),
            'with_items' => Location::has('items')->count(),
            'empty' => Location::doesntHave('items')->count(),
            'buildings' => Location::distinct('building')->whereNotNull('building')->count('building'),
        ];
    }

    /**
     * Get unique buildings list.
     */
    public function getBuildings()
    {
        return Location::distinct()
            ->whereNotNull('building')
            ->orderBy('building')
            ->pluck('building');
    }

    /**
     * Check if location has active items.
     */
    private function hasActiveItems(Location $location): bool
    {
        return $location->items()
            ->whereIn('status', [Item::STATUS_AVAILABLE, Item::STATUS_ASSIGNED, Item::STATUS_UNDER_MAINTENANCE])
            ->exists();
    }
}
