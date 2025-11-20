<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        // Create superadmin user
        $this->superadmin = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);
        $this->superadmin->assignRole('superadmin');

        // Create regular user
        $this->regularUser = User::factory()->create([
            'email' => 'user@test.com',
            'password' => 'password',
        ]);
        $this->regularUser->assignRole('staff');
    }

    /** @test */
    public function test_superadmin_can_view_users_index()
    {
        $response = $this->actingAs($this->superadmin)
            ->get(route('users.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('users/index'));
    }

    /** @test */
    public function test_regular_user_cannot_view_users_index()
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('users.index'));

        $response->assertStatus(403); // Forbidden
    }

    /** @test */
    public function test_superadmin_can_create_user()
    {
        $response = $this->actingAs($this->superadmin)
            ->post(route('users.store'), [
                'name' => 'New User',
                'email' => 'newuser@test.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'staff',
            ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success', 'User created successfully.');

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@test.com',
            'name' => 'New User',
        ]);

        $newUser = User::where('email', 'newuser@test.com')->first();
        $this->assertTrue($newUser->hasRole('staff'));
    }

    /** @test */
    public function test_superadmin_can_update_user()
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($this->superadmin)
            ->put(route('users.update', $user), [
                'name' => 'Updated Name',
                'email' => $user->email,
            ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success', 'User updated successfully.');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function test_superadmin_can_delete_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->superadmin)
            ->delete(route('users.destroy', $user));

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success', 'User deleted successfully.');

        // User should be soft deleted
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    /** @test */
    public function test_superadmin_can_restore_deleted_user()
    {
        $user = User::factory()->create();
        $user->delete(); // Soft delete

        $response = $this->actingAs($this->superadmin)
            ->post(route('users.restore', $user->id));

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success', 'User restored successfully.');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'deleted_at' => null,
        ]);
    }

    /** @test */
    public function test_superadmin_can_force_delete_user()
    {
        $user = User::factory()->create();
        $userId = $user->id;

        $response = $this->actingAs($this->superadmin)
            ->delete(route('users.force-delete', $user->id));

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success', 'User permanently deleted.');

        // User should be completely removed
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    /** @test */
    public function test_superadmin_can_assign_role_to_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->superadmin)
            ->post(route('users.assign-role', $user), [
                'role' => 'property_manager',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Role assigned successfully.');

        $user->refresh();
        $this->assertTrue($user->hasRole('property_manager'));
    }

    /** @test */
    public function test_superadmin_can_revoke_role_from_user()
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        $response = $this->actingAs($this->superadmin)
            ->post(route('users.revoke-role', $user), [
                'role' => 'staff',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Role revoked successfully.');

        $user->refresh();
        $this->assertFalse($user->hasRole('staff'));
    }

    /** @test */
    public function test_superadmin_can_assign_permission_to_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->superadmin)
            ->post(route('users.assign-permission', $user), [
                'permission' => 'items.view',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Permission assigned successfully.');

        $user->refresh();
        $this->assertTrue($user->hasPermissionTo('items.view'));
    }

    /** @test */
    public function test_validation_fails_when_creating_user_with_invalid_data()
    {
        $response = $this->actingAs($this->superadmin)
            ->post(route('users.store'), [
                'name' => '',
                'email' => 'invalid-email',
                'password' => '123', // Too short
                'role' => 'nonexistent-role',
            ]);

        $response->assertSessionHasErrors(['name', 'email', 'password', 'role']);
    }

    /** @test */
    public function test_guest_cannot_access_users_routes()
    {
        $response = $this->get(route('users.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('users.store'), []);
        $response->assertRedirect(route('login'));
    }
}