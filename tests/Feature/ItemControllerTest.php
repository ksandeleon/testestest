<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\Category;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ItemControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;
    protected User $regularUser;
    protected Category $category;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions
        $permissions = [
            'items.view_any',
            'items.view',
            'items.create',
            'items.update',
            'items.delete',
            'items.restore',
            'items.force_delete',
            'items.generate_qr',
            'items.print_qr',
            'items.view_history',
            'items.update_cost',
            'items.bulk_update',
            'items.export',
            'items.import',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create superadmin role with all permissions
        $superadminRole = Role::create(['name' => 'superadmin', 'guard_name' => 'web']);
        $superadminRole->givePermissionTo($permissions);

        // Create users
        $this->superadmin = User::factory()->create(['email' => 'superadmin@test.com']);
        $this->superadmin->assignRole($superadminRole);

        $this->regularUser = User::factory()->create(['email' => 'user@test.com']);

        // Create test data
        $this->category = Category::create([
            'name' => 'Test Category',
            'code' => 'TEST',
            'description' => 'Test category',
        ]);

        $this->location = Location::create([
            'name' => 'Test Location',
            'code' => 'TEST-LOC',
            'building' => 'Test Building',
        ]);
    }

    public function test_superadmin_can_view_items_index(): void
    {
        $response = $this->actingAs($this->superadmin)->get(route('items.index'));

        $response->assertSuccessful();
    }

    public function test_regular_user_cannot_view_items_index(): void
    {
        $response = $this->actingAs($this->regularUser)->get(route('items.index'));

        $response->assertForbidden();
    }

    public function test_superadmin_can_create_item(): void
    {
        $itemData = [
            'iar_number' => 'IAR-TEST-001',
            'property_number' => 'PROP-TEST-001',
            'fund_cluster' => 'FUND 100',
            'name' => 'Test Item',
            'description' => 'Test Description',
            'brand' => 'Test Brand',
            'model' => 'Test Model',
            'serial_number' => 'SN-12345',
            'acquisition_cost' => 50000.00,
            'quantity' => 1,
            'category_id' => $this->category->id,
            'location_id' => $this->location->id,
            'date_acquired' => '2024-01-01',
            'status' => 'available',
            'condition' => 'excellent',
        ];

        $response = $this->actingAs($this->superadmin)
            ->post(route('items.store'), $itemData);

        $response->assertRedirect();
        $this->assertDatabaseHas('items', [
            'name' => 'Test Item',
            'property_number' => 'PROP-TEST-001',
        ]);
    }

    public function test_guest_cannot_access_items_routes(): void
    {
        $this->get(route('items.index'))->assertRedirect(route('login'));
        $this->get(route('items.create'))->assertRedirect(route('login'));
    }
}
