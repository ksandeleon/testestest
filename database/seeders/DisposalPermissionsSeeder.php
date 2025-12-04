<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DisposalPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create disposal permissions
        $permissions = [
            'disposals.view_any',
            'disposals.view',
            'disposals.create',
            'disposals.update',
            'disposals.delete',
            'disposals.approve',
            'disposals.reject',
            'disposals.execute',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to super admin role
        $superAdmin = Role::where('name', 'super_admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }

        // Assign permissions to admin role
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo([
                'disposals.view_any',
                'disposals.view',
                'disposals.create',
                'disposals.approve',
                'disposals.reject',
            ]);
        }

        $this->command->info('Disposal permissions created and assigned successfully.');
    }
}

