<?php

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
});

require __DIR__.'/settings.php';
