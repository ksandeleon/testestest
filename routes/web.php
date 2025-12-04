<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DisposalController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // User Management Routes
    // Custom routes before resource routes
    Route::get('users/trash', [UserController::class, 'trash'])->name('users.trash');
    Route::get('users/{user}/assign-roles-permissions', [UserController::class, 'assignRolesPermissions'])->name('users.assign-roles-permissions');
    Route::post('users/{user}/assign-role', [UserController::class, 'assignRole'])->name('users.assign-role');
    Route::post('users/{user}/revoke-role', [UserController::class, 'revokeRole'])->name('users.revoke-role');
    Route::post('users/{user}/assign-permission', [UserController::class, 'assignPermission'])->name('users.assign-permission');
    Route::post('users/{user}/revoke-permission', [UserController::class, 'revokePermission'])->name('users.revoke-permission');
    Route::post('users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
    Route::delete('users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.force-delete');
    Route::get('users/export', [UserController::class, 'export'])->name('users.export');

    // Resource routes
    Route::resource('users', UserController::class);

    // Item Management Routes
    // Custom routes before resource routes
    Route::get('items/{item}/history', [ItemController::class, 'history'])->name('items.history');
    Route::post('items/{item}/generate-qr', [ItemController::class, 'generateQr'])->name('items.generate-qr');
    Route::get('items/{item}/print-qr', [ItemController::class, 'printQr'])->name('items.print-qr');
    Route::post('items/{item}/update-cost', [ItemController::class, 'updateCost'])->name('items.update-cost');
    Route::post('items/bulk-update', [ItemController::class, 'bulkUpdate'])->name('items.bulk-update');
    Route::post('items/{id}/restore', [ItemController::class, 'restore'])->name('items.restore');
    Route::delete('items/{id}/force-delete', [ItemController::class, 'forceDelete'])->name('items.force-delete');
    Route::get('items/export', [ItemController::class, 'export'])->name('items.export');
    Route::post('items/import', [ItemController::class, 'import'])->name('items.import');

    // Resource routes
    Route::resource('items', ItemController::class);

    // Maintenance Routes
    // Custom routes before resource routes
    Route::get('maintenance/calendar', [MaintenanceController::class, 'calendar'])->name('maintenance.calendar');
    Route::post('maintenance/{maintenance}/schedule', [MaintenanceController::class, 'schedule'])->name('maintenance.schedule');
    Route::post('maintenance/{maintenance}/start', [MaintenanceController::class, 'start'])->name('maintenance.start');
    Route::post('maintenance/{maintenance}/complete', [MaintenanceController::class, 'complete'])->name('maintenance.complete');
    Route::post('maintenance/{maintenance}/assign', [MaintenanceController::class, 'assign'])->name('maintenance.assign');
    Route::post('`maintenance/{maintenance}/approve-cost', [MaintenanceController::class, 'approveCost'])->name('maintenance.approve-cost');
    Route::get('maintenance/export', [MaintenanceController::class, 'export'])->name('maintenance.export');

    // Resource routes
    Route::resource('maintenance', MaintenanceController::class);

    // Assignment Routes
    Route::get('assignments/my-assignments', [AssignmentController::class, 'myAssignments'])->name('assignments.my-assignments');
    Route::get('assignments/overdue', [AssignmentController::class, 'overdue'])->name('assignments.overdue');
    Route::post('assignments/bulk-assign', [AssignmentController::class, 'bulkAssign'])->name('assignments.bulk-assign');
    Route::post('assignments/{assignment}/cancel', [AssignmentController::class, 'cancel'])->name('assignments.cancel');
    Route::post('assignments/{assignment}/approve', [AssignmentController::class, 'approve'])->name('assignments.approve');
    Route::post('assignments/{assignment}/reject', [AssignmentController::class, 'reject'])->name('assignments.reject');
    Route::get('assignments/export', [AssignmentController::class, 'export'])->name('assignments.export');
    Route::resource('assignments', AssignmentController::class);

    // Return Routes
    Route::get('returns/my-returns', [ReturnController::class, 'myReturns'])->name('returns.my-returns');
    Route::get('returns/pending-inspections', [ReturnController::class, 'pendingInspections'])->name('returns.pending-inspections');
    Route::get('returns/damaged', [ReturnController::class, 'damaged'])->name('returns.damaged');
    Route::get('returns/late', [ReturnController::class, 'late'])->name('returns.late');
    Route::get('returns/{return}/inspect', [ReturnController::class, 'inspect'])->name('returns.inspect');
    Route::post('returns/{return}/process-inspection', [ReturnController::class, 'processInspection'])->name('returns.process-inspection');
    Route::post('returns/{return}/approve', [ReturnController::class, 'approve'])->name('returns.approve');
    Route::post('returns/{return}/reject', [ReturnController::class, 'reject'])->name('returns.reject');
    Route::post('returns/{return}/calculate-penalty', [ReturnController::class, 'calculatePenalty'])->name('returns.calculate-penalty');
    Route::post('returns/{return}/mark-penalty-paid', [ReturnController::class, 'markPenaltyPaid'])->name('returns.mark-penalty-paid');
    Route::post('assignments/{assignment}/quick-return', [ReturnController::class, 'quickReturn'])->name('returns.quick-return');
    Route::resource('returns', ReturnController::class);

    // Disposal Routes
    Route::get('disposals/pending', [DisposalController::class, 'pending'])->name('disposals.pending');
    Route::get('disposals/{disposal}/approve', [DisposalController::class, 'showApprovalForm'])->name('disposals.show-approval');
    Route::post('disposals/{disposal}/approve', [DisposalController::class, 'approve'])->name('disposals.approve');
    Route::post('disposals/{disposal}/reject', [DisposalController::class, 'reject'])->name('disposals.reject');
    Route::get('disposals/{disposal}/execute', [DisposalController::class, 'showExecutionForm'])->name('disposals.show-execution');
    Route::post('disposals/{disposal}/execute', [DisposalController::class, 'execute'])->name('disposals.execute');
    Route::get('disposals/export', [DisposalController::class, 'export'])->name('disposals.export');
    Route::resource('disposals', DisposalController::class);

    // Category Routes
    Route::post('categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('categories.toggle-status');
    Route::post('categories/{id}/restore', [CategoryController::class, 'restore'])->name('categories.restore');
    Route::delete('categories/{id}/force-delete', [CategoryController::class, 'forceDestroy'])->name('categories.force-delete');
    Route::get('categories/{category}/reassign', [CategoryController::class, 'reassignForm'])->name('categories.reassign');
    Route::post('categories/{category}/reassign', [CategoryController::class, 'reassignItems'])->name('categories.reassign-items');
    Route::resource('categories', CategoryController::class);

    // Location Routes
    Route::post('locations/{location}/toggle-status', [LocationController::class, 'toggleStatus'])->name('locations.toggle-status');
    Route::post('locations/{id}/restore', [LocationController::class, 'restore'])->name('locations.restore');
    Route::delete('locations/{id}/force-delete', [LocationController::class, 'forceDestroy'])->name('locations.force-delete');
    Route::get('locations/{location}/reassign', [LocationController::class, 'reassignForm'])->name('locations.reassign');
    Route::post('locations/{location}/reassign', [LocationController::class, 'reassignItems'])->name('locations.reassign-items');
    Route::resource('locations', LocationController::class);
});

require __DIR__.'/settings.php';
