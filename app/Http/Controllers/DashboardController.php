<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dashboard Controller
 *
 * Provides dashboard views and widget data
 */
class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {
    }

    /**
     * Display the main dashboard
     */
    public function index(): Response
    {
        $this->authorize('dashboard.view');

        $statistics = $this->dashboardService->getStatistics();
        $recentActivities = $this->dashboardService->getRecentActivities(10);
        $pendingItems = $this->dashboardService->getPendingItems();
        $alerts = $this->dashboardService->getAlerts();

        return Inertia::render('dashboard', [
            'statistics' => $statistics,
            'recent_activities' => $recentActivities,
            'pending_items' => $pendingItems,
            'alerts' => $alerts,
        ]);
    }

    /**
     * Get statistics widget data
     */
    public function statistics()
    {
        $this->authorize('dashboard.view_stats');

        return response()->json([
            'statistics' => $this->dashboardService->getStatistics(),
        ]);
    }

    /**
     * Get chart widget data
     */
    public function charts()
    {
        $this->authorize('dashboard.view_charts');

        return response()->json([
            'charts' => [
                'items_by_category' => $this->dashboardService->getItemsByCategoryChart(),
                'items_by_status' => $this->dashboardService->getItemsByStatusChart(),
                'maintenance_by_month' => $this->dashboardService->getMaintenanceByMonthChart(),
            ],
        ]);
    }

    /**
     * Get pending items widget data
     */
    public function pending()
    {
        $this->authorize('dashboard.view_pending');

        return response()->json([
            'pending_items' => $this->dashboardService->getPendingItems(),
        ]);
    }

    /**
     * Get alerts widget data
     */
    public function alerts()
    {
        $this->authorize('dashboard.view_alerts');

        return response()->json([
            'alerts' => $this->dashboardService->getAlerts(),
        ]);
    }
}
