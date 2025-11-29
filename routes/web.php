<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\MaintenanceController;
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
    Route::post('maintenance/{maintenance}/approve-cost', [MaintenanceController::class, 'approveCost'])->name('maintenance.approve-cost');
    Route::get('maintenance/export', [MaintenanceController::class, 'export'])->name('maintenance.export');

    // Resource routes
    Route::resource('maintenance', MaintenanceController::class);
});

require __DIR__.'/settings.php';
