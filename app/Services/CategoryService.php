<?php

namespace App\Services;

use App\Exceptions\CategoryException;
use App\Models\Category;
use App\Models\Item;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CategoryService
{
    /**
     * Get paginated list of categories with optional filters.
     */
    public function getCategories(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Category::query()->withCount('items');

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
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
     * Get all active categories.
     */
    public function getActiveCategories(): Collection
    {
        return Category::active()->orderBy('name')->get();
    }

    /**
     * Get category by ID.
     */
    public function getCategoryById(int $id, bool $withTrashed = false): Category
    {
        $query = Category::withCount('items');

        if ($withTrashed) {
            $query->withTrashed();
        }

        $category = $query->find($id);

        if (!$category) {
            throw CategoryException::notFound($id);
        }

        return $category;
    }

    /**
     * Create a new category.
     */
    public function createCategory(array $data): Category
    {
        // Check if code already exists
        if (Category::where('code', $data['code'])->exists()) {
            throw CategoryException::codeExists($data['code']);
        }

        return DB::transaction(function () use ($data) {
            $category = Category::create([
                'name' => $data['name'],
                'code' => strtoupper($data['code']),
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            activity()
                ->performedOn($category)
                ->log('Category created');

            return $category;
        });
    }

    /**
     * Update an existing category.
     */
    public function updateCategory(int $id, array $data): Category
    {
        $category = $this->getCategoryById($id);

        // Check if code already exists (excluding current category)
        if (isset($data['code']) &&
            Category::where('code', $data['code'])
                ->where('id', '!=', $id)
                ->exists()) {
            throw CategoryException::codeExists($data['code']);
        }

        return DB::transaction(function () use ($category, $data) {
            $oldAttributes = $category->getAttributes();

            $category->update([
                'name' => $data['name'] ?? $category->name,
                'code' => isset($data['code']) ? strtoupper($data['code']) : $category->code,
                'description' => $data['description'] ?? $category->description,
                'is_active' => $data['is_active'] ?? $category->is_active,
            ]);

            activity()
                ->performedOn($category)
                ->withProperties([
                    'old' => $oldAttributes,
                    'new' => $category->getAttributes(),
                ])
                ->log('Category updated');

            return $category->fresh();
        });
    }

    /**
     * Toggle category active status.
     */
    public function toggleActiveStatus(int $id): Category
    {
        $category = $this->getCategoryById($id);

        // If trying to deactivate, check for active items
        if ($category->is_active && $this->hasActiveItems($category)) {
            throw CategoryException::cannotDeactivate($category->name);
        }

        return DB::transaction(function () use ($category) {
            $newStatus = !$category->is_active;
            $category->update(['is_active' => $newStatus]);

            activity()
                ->performedOn($category)
                ->log($newStatus ? 'Category activated' : 'Category deactivated');

            return $category->fresh();
        });
    }

    /**
     * Soft delete a category.
     */
    public function deleteCategory(int $id): bool
    {
        $category = $this->getCategoryById($id);

        // Check if category has items
        if ($category->items()->exists()) {
            throw CategoryException::hasItems($category->name);
        }

        return DB::transaction(function () use ($category) {
            activity()
                ->performedOn($category)
                ->log('Category deleted');

            return $category->delete();
        });
    }

    /**
     * Restore a soft-deleted category.
     */
    public function restoreCategory(int $id): Category
    {
        $category = $this->getCategoryById($id, withTrashed: true);

        if (!$category->trashed()) {
            throw new CategoryException("Category '{$category->name}' is not deleted.");
        }

        DB::transaction(function () use ($category) {
            $category->restore();

            activity()
                ->performedOn($category)
                ->log('Category restored');
        });

        return $category->fresh();
    }

    /**
     * Force delete a category permanently.
     */
    public function forceDeleteCategory(int $id): bool
    {
        $category = $this->getCategoryById($id, withTrashed: true);

        // Check if category has items (including soft-deleted items)
        if ($category->items()->withTrashed()->exists()) {
            throw CategoryException::hasItems($category->name);
        }

        return DB::transaction(function () use ($category) {
            activity()
                ->performedOn($category)
                ->log('Category permanently deleted');

            return $category->forceDelete();
        });
    }

    /**
     * Reassign items from one category to another.
     */
    public function reassignItems(int $fromCategoryId, int $toCategoryId): int
    {
        $fromCategory = $this->getCategoryById($fromCategoryId);
        $toCategory = $this->getCategoryById($toCategoryId);

        return DB::transaction(function () use ($fromCategory, $toCategory) {
            $count = $fromCategory->items()->update(['category_id' => $toCategory->id]);

            activity()
                ->performedOn($fromCategory)
                ->withProperties([
                    'to_category' => $toCategory->name,
                    'items_count' => $count,
                ])
                ->log('Items reassigned to another category');

            return $count;
        });
    }

    /**
     * Get category statistics.
     */
    public function getCategoryStatistics(): array
    {
        return [
            'total' => Category::count(),
            'active' => Category::active()->count(),
            'inactive' => Category::where('is_active', false)->count(),
            'deleted' => Category::onlyTrashed()->count(),
            'with_items' => Category::has('items')->count(),
            'empty' => Category::doesntHave('items')->count(),
        ];
    }

    /**
     * Check if category has active items.
     */
    private function hasActiveItems(Category $category): bool
    {
        return $category->items()
            ->whereIn('status', [Item::STATUS_AVAILABLE, Item::STATUS_ASSIGNED, Item::STATUS_UNDER_MAINTENANCE])
            ->exists();
    }
}
