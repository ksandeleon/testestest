<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Disposal;
use App\Models\Item;
use App\Models\Maintenance;
use App\Models\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Dashboard Service
 *
 * Provides widget data for role-based dashboards
 */
class DashboardService
{
    /**
     * Get dashboard statistics
     */
    public function getStatistics(): array
    {
        return [
            'items' => $this->getItemStatistics(),
            'assignments' => $this->getAssignmentStatistics(),
            'maintenance' => $this->getMaintenanceStatistics(),
            'requests' => $this->getRequestStatistics(),
            'disposals' => $this->getDisposalStatistics(),
        ];
    }

    /**
     * Get item statistics
     */
    public function getItemStatistics(): array
    {
        $total = Item::count();
        $available = Item::where('status', 'available')->count();
        $assigned = Item::where('status', 'assigned')->count();
        $inMaintenance = Item::where('status', 'in_maintenance')->count();
        $damaged = Item::where('status', 'damaged')->count();

        return [
            'total' => $total,
            'available' => $available,
            'assigned' => $assigned,
            'in_maintenance' => $inMaintenance,
            'damaged' => $damaged,
            'utilization_rate' => $total > 0 ? round(($assigned / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get assignment statistics
     */
    public function getAssignmentStatistics(): array
    {
        $active = Assignment::where('status', 'active')->count();
        $overdue = Assignment::where('is_overdue', true)->count();
        $pendingReturn = Assignment::whereHas('itemReturn', function ($q) {
            $q->where('status', 'pending');
        })->count();

        return [
            'active' => $active,
            'overdue' => $overdue,
            'pending_return' => $pendingReturn,
        ];
    }

    /**
     * Get maintenance statistics
     */
    public function getMaintenanceStatistics(): array
    {
        $scheduled = Maintenance::where('status', 'scheduled')->count();
        $inProgress = Maintenance::where('status', 'in_progress')->count();
        $overdue = Maintenance::where('status', 'scheduled')
            ->where('scheduled_date', '<', now())
            ->count();

        return [
            'scheduled' => $scheduled,
            'in_progress' => $inProgress,
            'overdue' => $overdue,
        ];
    }

    /**
     * Get request statistics
     */
    public function getRequestStatistics(): array
    {
        $pending = Request::where('status', 'pending')->count();
        $underReview = Request::where('status', 'under_review')->count();
        $changesRequested = Request::where('status', 'changes_requested')->count();

        return [
            'pending' => $pending,
            'under_review' => $underReview,
            'changes_requested' => $changesRequested,
            'total_pending' => $pending + $underReview + $changesRequested,
        ];
    }

    /**
     * Get disposal statistics
     */
    public function getDisposalStatistics(): array
    {
        $pending = Disposal::where('status', 'pending')->count();
        $approved = Disposal::where('status', 'approved')
            ->whereNull('executed_at')
            ->count();

        return [
            'pending' => $pending,
            'approved_pending_execution' => $approved,
        ];
    }

    /**
     * Get recent activities for timeline
     */
    public function getRecentActivities(int $limit = 10): array
    {
        return activity()
            ->with('causer')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'user' => $activity->causer?->name ?? 'System',
                    'created_at' => $activity->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }

    /**
     * Get pending items requiring action
     */
    public function getPendingItems(): array
    {
        return [
            'overdue_assignments' => Assignment::where('is_overdue', true)
                ->with(['user', 'item'])
                ->limit(5)
                ->get()
                ->map(fn($a) => [
                    'type' => 'overdue_assignment',
                    'title' => "Overdue: {$a->item->name}",
                    'description' => "Assigned to {$a->user?->name}",
                    'due_date' => $a->due_date,
                    'url' => route('assignments.show', $a),
                ])
                ->toArray(),

            'pending_requests' => Request::where('status', 'pending')
                ->with('user')
                ->limit(5)
                ->get()
                ->map(fn($r) => [
                    'type' => 'pending_request',
                    'title' => $r->title,
                    'description' => "Requested by {$r->user?->name}",
                    'created_at' => $r->created_at,
                    'url' => route('requests.show', $r),
                ])
                ->toArray(),

            'scheduled_maintenance' => Maintenance::where('status', 'scheduled')
                ->where('scheduled_date', '<=', now()->addDays(7))
                ->with('item')
                ->limit(5)
                ->get()
                ->map(fn($m) => [
                    'type' => 'scheduled_maintenance',
                    'title' => $m->title,
                    'description' => "Item: {$m->item->name}",
                    'scheduled_date' => $m->scheduled_date,
                    'url' => route('maintenance.show', $m),
                ])
                ->toArray(),
        ];
    }

    /**
     * Get alerts and warnings
     */
    public function getAlerts(): array
    {
        $alerts = [];

        // Critical alerts
        $overdueCount = Assignment::where('is_overdue', true)->count();
        if ($overdueCount > 0) {
            $alerts[] = [
                'type' => 'error',
                'message' => "{$overdueCount} overdue assignment(s)",
                'action' => route('assignments.index', ['is_overdue' => true]),
            ];
        }

        $damagedCount = Item::where('status', 'damaged')->count();
        if ($damagedCount > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$damagedCount} damaged item(s) need attention",
                'action' => route('items.index', ['status' => 'damaged']),
            ];
        }

        $overdueMaintenanceCount = Maintenance::where('status', 'scheduled')
            ->where('scheduled_date', '<', now())
            ->count();
        if ($overdueMaintenanceCount > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$overdueMaintenanceCount} overdue maintenance task(s)",
                'action' => route('maintenance.index'),
            ];
        }

        return $alerts;
    }

    /**
     * Get chart data for items by category
     */
    public function getItemsByCategoryChart(): array
    {
        $data = Item::select('category_id', DB::raw('count(*) as count'))
            ->with('category')
            ->groupBy('category_id')
            ->get()
            ->map(fn($item) => [
                'name' => $item->category?->name ?? 'Uncategorized',
                'value' => $item->count,
            ])
            ->toArray();

        return [
            'type' => 'pie',
            'title' => 'Items by Category',
            'data' => $data,
        ];
    }

    /**
     * Get chart data for items by status
     */
    public function getItemsByStatusChart(): array
    {
        $data = Item::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'name' => ucwords(str_replace('_', ' ', $item->status)),
                'value' => $item->count,
            ])
            ->toArray();

        return [
            'type' => 'bar',
            'title' => 'Items by Status',
            'data' => $data,
        ];
    }

    /**
     * Get chart data for maintenance by month
     */
    public function getMaintenanceByMonthChart(): array
    {
        $data = Maintenance::whereNotNull('completed_at')
            ->where('completed_at', '>=', now()->subMonths(6))
            ->select(DB::raw('DATE_FORMAT(completed_at, "%Y-%m") as month'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'count' => $item->count,
            ])
            ->toArray();

        return [
            'type' => 'line',
            'title' => 'Maintenance Completed (Last 6 Months)',
            'data' => $data,
        ];
    }
}
