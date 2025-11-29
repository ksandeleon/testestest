<?php

namespace App\Providers;

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
