<?php

namespace App\Providers;

use App\Models\Assignment;
use App\Models\Maintenance;
use App\Observers\AssignmentObserver;
use App\Observers\MaintenanceObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers
        Assignment::observe(AssignmentObserver::class);
        Maintenance::observe(MaintenanceObserver::class);

        // Register authorization gates for all permissions
        // This allows $this->authorize('permission.name') to work
        Gate::before(function ($user, $ability) {
            // Superadmin has all permissions
            if ($user->hasRole('superadmin')) {
                return true;
            }

            // Check if user has the specific permission
            return $user->hasPermissionTo($ability) ? true : null;
        });
    }
}
