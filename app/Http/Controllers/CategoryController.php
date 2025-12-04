<?php

namespace App\Http\Controllers;

use App\Exceptions\CategoryException;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService
    ) {
    }

    /**
     * Display a listing of categories.
     */
    public function index(Request $request): Response
    {
        $this->authorize('categories.view_any');

        $filters = [
            'search' => $request->get('search'),
            'is_active' => $request->get('is_active'),
            'with_trashed' => $request->get('with_trashed'),
        ];

        $categories = $this->categoryService->getCategories(
            $filters,
            $request->get('per_page', 15)
        );

        $statistics = $this->categoryService->getCategoryStatistics();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'statistics' => $statistics,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        $this->authorize('categories.create');

        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        try {
            $category = $this->categoryService->createCategory($request->validated());

            return redirect()
                ->route('categories.index')
                ->with('success', "Category '{$category->name}' created successfully.");
        } catch (CategoryException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(int $id): Response
    {
        $this->authorize('categories.view');

        try {
            $category = $this->categoryService->getCategoryById($id);
            $category->load(['items' => function ($query) {
                $query->with(['category', 'location'])->latest()->limit(10);
            }]);

            return Inertia::render('categories/show', [
                'category' => $category,
            ]);
        } catch (CategoryException $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(int $id): Response
    {
        $this->authorize('categories.update');

        try {
            $category = $this->categoryService->getCategoryById($id);

            return Inertia::render('categories/edit', [
                'category' => $category,
            ]);
        } catch (CategoryException $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, int $id): RedirectResponse
    {
        try {
            $category = $this->categoryService->updateCategory($id, $request->validated());

            return redirect()
                ->route('categories.index')
                ->with('success', "Category '{$category->name}' updated successfully.");
        } catch (CategoryException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified category (soft delete).
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->authorize('categories.delete');

        try {
            $category = $this->categoryService->getCategoryById($id);
            $categoryName = $category->name;

            $this->categoryService->deleteCategory($id);

            return redirect()
                ->route('categories.index')
                ->with('success', "Category '{$categoryName}' deleted successfully.");
        } catch (CategoryException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Toggle category active status.
     */
    public function toggleStatus(int $id): RedirectResponse
    {
        $this->authorize('categories.update');

        try {
            $category = $this->categoryService->toggleActiveStatus($id);
            $status = $category->is_active ? 'activated' : 'deactivated';

            return back()
                ->with('success', "Category '{$category->name}' {$status} successfully.");
        } catch (CategoryException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Restore a soft-deleted category.
     */
    public function restore(int $id): RedirectResponse
    {
        $this->authorize('categories.delete');

        try {
            $category = $this->categoryService->restoreCategory($id);

            return redirect()
                ->route('categories.index')
                ->with('success', "Category '{$category->name}' restored successfully.");
        } catch (CategoryException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Permanently delete a category.
     */
    public function forceDestroy(int $id): RedirectResponse
    {
        $this->authorize('categories.delete');

        try {
            $category = $this->categoryService->getCategoryById($id, withTrashed: true);
            $categoryName = $category->name;

            $this->categoryService->forceDeleteCategory($id);

            return redirect()
                ->route('categories.index')
                ->with('success', "Category '{$categoryName}' permanently deleted.");
        } catch (CategoryException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Show form to reassign items.
     */
    public function reassignForm(int $id): Response
    {
        $this->authorize('categories.update');

        try {
            $category = $this->categoryService->getCategoryById($id);
            $category->loadCount('items');

            $otherCategories = $this->categoryService->getActiveCategories()
                ->where('id', '!=', $id);

            return Inertia::render('categories/reassign', [
                'category' => $category,
                'categories' => $otherCategories,
            ]);
        } catch (CategoryException $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Reassign items from one category to another.
     */
    public function reassignItems(Request $request, int $id): RedirectResponse
    {
        $this->authorize('categories.update');

        $request->validate([
            'to_category_id' => ['required', 'exists:categories,id', 'different:id'],
        ]);

        try {
            $count = $this->categoryService->reassignItems($id, $request->to_category_id);

            $fromCategory = $this->categoryService->getCategoryById($id);
            $toCategory = $this->categoryService->getCategoryById($request->to_category_id);

            return redirect()
                ->route('categories.index')
                ->with('success', "{$count} items reassigned from '{$fromCategory->name}' to '{$toCategory->name}'.");
        } catch (CategoryException $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }
}
