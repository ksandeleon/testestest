<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
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

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
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

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'] ?? $user->password,
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('users.delete');

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Restore the specified soft-deleted user.
     */
    public function restore(int $id): RedirectResponse
    {
        $this->authorize('users.restore');

        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return redirect()->route('users.index')
            ->with('success', 'User restored successfully.');
    }

    /**
     * Permanently delete the specified user.
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $this->authorize('users.force_delete');

        $user = User::withTrashed()->findOrFail($id);
        $user->forceDelete();

        return redirect()->route('users.index')
            ->with('success', 'User permanently deleted.');
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
     * Export users data.
     */
    public function export(): RedirectResponse
    {
        $this->authorize('users.export');

        // Export logic will be implemented when needed
        
        return back()->with('info', 'Export functionality coming soon.');
    }
}
