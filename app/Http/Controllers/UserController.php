<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    /**
     * Display a listing of users.
     */
    public function index(): Response
    {
        $this->authorize('users.view_any');

        $users = User::with('roles')
            ->latest()
            ->paginate(15);

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $this->authorize('users.create');

        return Inertia::render('users/create', [
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('users.create');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        try {
            $this->userService->create($validated, sendInvitation: false);

            return redirect()->route('users.index')
                ->with('success', 'User created successfully.');
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $this->authorize('users.view');

        return Inertia::render('users/show', [
            'user' => $user->load('roles', 'permissions'),
        ]);
    }

    /**
     * Show the form for assigning roles and permissions to a user.
     */
    public function assignRolesPermissions(User $user): Response
    {
        $this->authorize('users.assign_roles');

        // Get all roles with their permissions
        $allRoles = Role::with('permissions')->get(['id', 'name']);

        // Get all permissions grouped by category
        $allPermissions = Permission::all(['id', 'name'])
            ->groupBy(function ($permission) {
                // Extract category from permission name (e.g., "users.view" -> "users")
                return explode('.', $permission->name)[0];
            })
            ->map(function ($group) {
                return $group->values();
            });

        // Get user's current roles and permissions
        $user->load('roles.permissions', 'permissions');

        return Inertia::render('users/assign', [
            'user' => $user,
            'allRoles' => $allRoles,
            'allPermissions' => $allPermissions,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $this->authorize('users.update');

        return Inertia::render('users/edit', [
            'user' => $user->load('roles'),
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('users.update');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        try {
            $this->userService->update($user, $validated);

            return redirect()->route('users.index')
                ->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('users.delete');

        try {
            $this->userService->delete($user, force: false);

            return redirect()->route('users.index')
                ->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Restore the specified soft-deleted user.
     */
    public function restore(int $id): RedirectResponse
    {
        $this->authorize('users.restore');

        $user = User::withTrashed()->findOrFail($id);
        $this->userService->restore($user);

        return back()->with('success', 'User restored successfully.');
    }

    /**
     * Permanently delete the specified user.
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $this->authorize('users.force_delete');

        $user = User::withTrashed()->findOrFail($id);

        try {
            $this->userService->delete($user, force: true);

            return back()->with('success', 'User permanently deleted.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Assign a role to the specified user.
     */
    public function assignRole(Request $request, User $user): RedirectResponse
    {
        $this->authorize('users.assign_roles');

        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'Role assigned successfully.');
    }

    /**
     * Revoke a role from the specified user.
     */
    public function revokeRole(Request $request, User $user): RedirectResponse
    {
        $this->authorize('users.revoke_roles');

        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->removeRole($validated['role']);

        return back()->with('success', 'Role revoked successfully.');
    }

    /**
     * Assign a direct permission to the specified user.
     */
    public function assignPermission(Request $request, User $user): RedirectResponse
    {
        $this->authorize('users.assign_permissions');

        $validated = $request->validate([
            'permission' => ['required', 'string', 'exists:permissions,name'],
        ]);

        $user->givePermissionTo($validated['permission']);

        return back()->with('success', 'Permission assigned successfully.');
    }

    /**
     * Revoke a direct permission from the specified user.
     */
    public function revokePermission(Request $request, User $user): RedirectResponse
    {
        $this->authorize('users.assign_permissions');

        $validated = $request->validate([
            'permission' => ['required', 'string', 'exists:permissions,name'],
        ]);

        $user->revokePermissionTo($validated['permission']);

        return back()->with('success', 'Permission revoked successfully.');
    }

    /**
     * Display a listing of soft-deleted users.
     */
    public function trash(): Response
    {
        $this->authorize('users.view_any');

        $users = User::onlyTrashed()
            ->with('roles')
            ->latest('deleted_at')
            ->paginate(15);

        return Inertia::render('users/trash', [
            'users' => $users,
        ]);
    }

    /**
     * Export users data.
     */
    public function export(): RedirectResponse
    {
        $this->authorize('users.export');

        // Export logic will be implemented when needed

        return back()->with('info', 'Export functionality coming soon.');
    }

    /**
     * Toggle user active/inactive status.
     */
    public function toggleStatus(User $user, Request $request): RedirectResponse
    {
        $this->authorize('users.update');

        $validated = $request->validate([
            'force_return_items' => ['boolean'],
        ]);

        try {
            $this->userService->toggleStatus(
                $user,
                $validated['force_return_items'] ?? false
            );

            $status = $user->fresh()->is_active ? 'activated' : 'deactivated';

            return back()->with('success', "User {$status} successfully.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Deactivate user (with option to force return items).
     */
    public function deactivate(User $user, Request $request): RedirectResponse
    {
        $this->authorize('users.update');

        $validated = $request->validate([
            'force_return_items' => ['boolean'],
        ]);

        try {
            $this->userService->deactivate(
                $user,
                $validated['force_return_items'] ?? false
            );

            return back()->with('success', 'User deactivated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Activate user.
     */
    public function activate(User $user): RedirectResponse
    {
        $this->authorize('users.update');

        try {
            $this->userService->activate($user);

            return back()->with('success', 'User activated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
