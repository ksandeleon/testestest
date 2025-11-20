<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create all granular permissions
        $permissions = $this->getPermissions();
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create predefined roles with their permissions
        $this->createSuperAdministrator();
        $this->createPropertyAdministrator();
        $this->createPropertyManager();
        $this->createInventoryClerk();
        $this->createAssignmentOfficer();
        $this->createMaintenanceCoordinator();
        $this->createAuditor();
        $this->createDepartmentHead();
        $this->createStaffUser();
        $this->createReportViewer();
    }

    /**
     * Get all granular permissions
     */
    private function getPermissions(): array
    {
        return [
            // 2.1 User Management Permissions
            'users.view_any',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.restore',
            'users.force_delete',
            'users.assign_roles',
            'users.revoke_roles',
            'users.assign_permissions',
            'users.export',

            // 2.2 Item/Inventory Management Permissions
            'items.view_any',
            'items.view',
            'items.create',
            'items.update',
            'items.delete',
            'items.restore',
            'items.force_delete',
            'items.export',
            'items.import',
            'items.view_cost',
            'items.update_cost',
            'items.generate_qr',
            'items.print_qr',
            'items.view_history',
            'items.bulk_update',

            // 2.3 Item Categories & Classification Permissions
            'categories.view_any',
            'categories.view',
            'categories.create',
            'categories.update',
            'categories.delete',
            'locations.view_any',
            'locations.view',
            'locations.create',
            'locations.update',
            'locations.delete',

            // 2.4 Assignment/Borrowing Permissions
            'assignments.view_any',
            'assignments.view',
            'assignments.view_own',
            'assignments.create',
            'assignments.update',
            'assignments.delete',
            'assignments.assign_to_self',
            'assignments.assign_to_others',
            'assignments.approve',
            'assignments.reject',
            'assignments.export',

            // 2.5 Return/Check-in Permissions
            'returns.view_any',
            'returns.view',
            'returns.create',
            'returns.update',
            'returns.delete',
            'returns.mark_returned',
            'returns.inspect',
            'returns.approve_condition',
            'returns.report_damage',

            // 2.6 Maintenance Permissions
            'maintenance.view_any',
            'maintenance.view',
            'maintenance.create',
            'maintenance.update',
            'maintenance.delete',
            'maintenance.schedule',
            'maintenance.complete',
            'maintenance.assign',
            'maintenance.approve_cost',

            // 2.7 Disposal Permissions
            'disposals.view_any',
            'disposals.view',
            'disposals.create',
            'disposals.update',
            'disposals.delete',
            'disposals.request',
            'disposals.approve',
            'disposals.execute',
            'disposals.export',

            // 2.8 Reporting Permissions
            'reports.view',
            'reports.export',
            'reports.inventory_summary',
            'reports.user_assignments',
            'reports.item_history',
            'reports.maintenance',
            'reports.disposal',
            'reports.financial',
            'reports.activity',
            'reports.custom',

            // 2.9 Activity Log Permissions
            'activity_logs.view_any',
            'activity_logs.view',
            'activity_logs.export',
            'activity_logs.delete',

            // 2.10 Dashboard & Analytics Permissions
            'dashboard.view',
            'dashboard.view_stats',
            'dashboard.view_charts',
            'dashboard.view_pending',
            'dashboard.view_alerts',

            // 2.11 Settings & Configuration Permissions
            'settings.view',
            'settings.update',
            'settings.manage_system',
            'settings.manage_email',
            'settings.manage_notifications',
            'settings.manage_security',

            // 2.12 Notification Permissions
            'notifications.view',
            'notifications.create',
            'notifications.mark_read',
            'notifications.delete',
            'notifications.send_bulk',

            // 2.13 Request/Approval Workflow Permissions
            'requests.view_any',
            'requests.view',
            'requests.create',
            'requests.update',
            'requests.delete',
            'requests.approve',
            'requests.reject',
        ];
    }

    /**
     * 3.1 Super Administrator
     */
    private function createSuperAdministrator(): void
    {
        $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $role->syncPermissions(Permission::all());
    }

    /**
     * 3.2 Property Administrator
     */
    private function createPropertyAdministrator(): void
    {
        $role = Role::firstOrCreate(['name' => 'property_administrator', 'guard_name' => 'web']);

        $permissions = [
            // All items permissions
            'items.view_any', 'items.view', 'items.create', 'items.update', 'items.delete',
            'items.restore', 'items.export', 'items.import', 'items.view_cost', 'items.update_cost',
            'items.generate_qr', 'items.print_qr', 'items.view_history', 'items.bulk_update',

            // All assignments permissions
            'assignments.view_any', 'assignments.view', 'assignments.create', 'assignments.update',
            'assignments.delete', 'assignments.assign_to_self', 'assignments.assign_to_others',
            'assignments.approve', 'assignments.reject', 'assignments.export',

            // All returns permissions
            'returns.view_any', 'returns.view', 'returns.create', 'returns.update', 'returns.delete',
            'returns.mark_returned', 'returns.inspect', 'returns.approve_condition', 'returns.report_damage',

            // All disposals except execute (needs approval)
            'disposals.view_any', 'disposals.view', 'disposals.create', 'disposals.update',
            'disposals.delete', 'disposals.request', 'disposals.approve', 'disposals.export',

            // All maintenance permissions
            'maintenance.view_any', 'maintenance.view', 'maintenance.create', 'maintenance.update',
            'maintenance.delete', 'maintenance.schedule', 'maintenance.complete', 'maintenance.assign',
            'maintenance.approve_cost',

            // All reports permissions
            'reports.view', 'reports.export', 'reports.inventory_summary', 'reports.user_assignments',
            'reports.item_history', 'reports.maintenance', 'reports.disposal', 'reports.financial',
            'reports.activity', 'reports.custom',

            // Activity logs view permissions
            'activity_logs.view_any', 'activity_logs.view', 'activity_logs.export',

            // Categories and locations
            'categories.view_any', 'categories.view', 'categories.create', 'categories.update', 'categories.delete',
            'locations.view_any', 'locations.view', 'locations.create', 'locations.update', 'locations.delete',

            // Dashboard permissions
            'dashboard.view', 'dashboard.view_stats', 'dashboard.view_charts', 'dashboard.view_pending', 'dashboard.view_alerts',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.3 Property Manager
     */
    private function createPropertyManager(): void
    {
        $role = Role::firstOrCreate(['name' => 'property_manager', 'guard_name' => 'web']);

        $permissions = [
            'items.view_any', 'items.view', 'items.create', 'items.update',
            'items.generate_qr', 'items.print_qr', 'items.view_history',
            'assignments.view_any', 'assignments.create', 'assignments.assign_to_others',
            'returns.view_any', 'returns.create', 'returns.mark_returned',
            'maintenance.view_any', 'maintenance.create', 'maintenance.schedule',
            'reports.view', 'reports.user_assignments', 'reports.item_history', 'reports.inventory_summary',
            'activity_logs.view_any',
            'dashboard.view', 'dashboard.view_stats', 'dashboard.view_charts', 'dashboard.view_pending', 'dashboard.view_alerts',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.4 Inventory Clerk
     */
    private function createInventoryClerk(): void
    {
        $role = Role::firstOrCreate(['name' => 'inventory_clerk', 'guard_name' => 'web']);

        $permissions = [
            'items.view_any', 'items.view', 'items.create', 'items.update',
            'items.generate_qr', 'items.print_qr',
            'categories.view_any', 'locations.view_any',
            'assignments.view_any', 'assignments.create',
            'returns.view_any', 'returns.create', 'returns.mark_returned',
            'reports.view', 'reports.inventory_summary',
            'dashboard.view',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.5 Assignment Officer
     */
    private function createAssignmentOfficer(): void
    {
        $role = Role::firstOrCreate(['name' => 'assignment_officer', 'guard_name' => 'web']);

        $permissions = [
            'items.view_any', 'items.view',
            'assignments.view_any', 'assignments.view', 'assignments.create', 'assignments.assign_to_others',
            'returns.view_any', 'returns.view', 'returns.create', 'returns.mark_returned', 'returns.inspect',
            'reports.view', 'reports.user_assignments',
            'dashboard.view', 'dashboard.view_pending',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.6 Maintenance Coordinator
     */
    private function createMaintenanceCoordinator(): void
    {
        $role = Role::firstOrCreate(['name' => 'maintenance_coordinator', 'guard_name' => 'web']);

        $permissions = [
            'items.view_any', 'items.view',
            'maintenance.view_any', 'maintenance.view', 'maintenance.create', 'maintenance.update',
            'maintenance.schedule', 'maintenance.complete', 'maintenance.assign',
            'reports.view', 'reports.maintenance',
            'dashboard.view',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.7 Auditor
     */
    private function createAuditor(): void
    {
        $role = Role::firstOrCreate(['name' => 'auditor', 'guard_name' => 'web']);

        $permissions = [
            // All view permissions
            'items.view_any', 'items.view', 'items.view_cost', 'items.view_history',
            'assignments.view_any', 'assignments.view',
            'returns.view_any', 'returns.view',
            'maintenance.view_any', 'maintenance.view',
            'disposals.view_any', 'disposals.view',
            'categories.view_any', 'categories.view',
            'locations.view_any', 'locations.view',

            // All reports permissions
            'reports.view', 'reports.export', 'reports.inventory_summary', 'reports.user_assignments',
            'reports.item_history', 'reports.maintenance', 'reports.disposal', 'reports.financial',
            'reports.activity', 'reports.custom',

            // Activity logs
            'activity_logs.view_any', 'activity_logs.view', 'activity_logs.export',

            // Dashboard
            'dashboard.view', 'dashboard.view_stats', 'dashboard.view_charts', 'dashboard.view_pending', 'dashboard.view_alerts',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.8 Department Head
     */
    private function createDepartmentHead(): void
    {
        $role = Role::firstOrCreate(['name' => 'department_head', 'guard_name' => 'web']);

        $permissions = [
            'items.view_any', 'items.view',
            'assignments.view_any', 'assignments.view',
            'requests.view', 'requests.create',
            'reports.view', 'reports.user_assignments',
            'dashboard.view',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.9 Staff User (Regular Employee)
     */
    private function createStaffUser(): void
    {
        $role = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);

        $permissions = [
            'items.view', // only their items
            'assignments.view_own',
            'returns.create', // request return
            'requests.create', // request new items
            'notifications.view',
            'dashboard.view', // personal dashboard only
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * 3.10 Report Viewer
     */
    private function createReportViewer(): void
    {
        $role = Role::firstOrCreate(['name' => 'report_viewer', 'guard_name' => 'web']);

        $permissions = [
            // All reports permissions
            'reports.view', 'reports.export', 'reports.inventory_summary', 'reports.user_assignments',
            'reports.item_history', 'reports.maintenance', 'reports.disposal', 'reports.financial',
            'reports.activity', 'reports.custom',

            // Dashboard
            'dashboard.view', 'dashboard.view_stats', 'dashboard.view_charts',

            // Read-only item access
            'items.view_any', 'items.view',
        ];

        $role->syncPermissions($permissions);
    }
}
