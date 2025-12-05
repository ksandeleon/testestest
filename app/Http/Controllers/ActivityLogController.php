<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of all activity logs.
     */
    public function index(Request $request): Response
    {
        $this->authorize('activity_logs.view_any');

        $query = Activity::with(['causer', 'subject'])
            ->latest();

        // Filter by log name (entity type)
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Filter by causer (user who performed the action)
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        // Filter by subject type (Item, User, etc.)
        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->subject_type);
        }

        // Filter by description (action type)
        if ($request->filled('description')) {
            $query->where('description', 'like', '%' . $request->description . '%');
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->paginate(50);

        // Get available filter options
        $logNames = Activity::select('log_name')
            ->distinct()
            ->whereNotNull('log_name')
            ->pluck('log_name');

        $subjectTypes = Activity::select('subject_type')
            ->distinct()
            ->whereNotNull('subject_type')
            ->pluck('subject_type')
            ->map(function ($type) {
                // Convert App\Models\Item to Item
                return class_basename($type);
            });

        return Inertia::render('activity-logs/index', [
            'activities' => $activities,
            'filters' => $request->only(['log_name', 'causer_id', 'subject_type', 'description', 'date_from', 'date_to']),
            'logNames' => $logNames,
            'subjectTypes' => $subjectTypes,
        ]);
    }

    /**
     * Display a specific activity log entry.
     */
    public function show(Activity $activity): Response
    {
        $this->authorize('activity_logs.view');

        $activity->load(['causer', 'subject']);

        return Inertia::render('activity-logs/show', [
            'activity' => $activity,
        ]);
    }

    /**
     * Clean old activity logs based on retention policy.
     */
    public function clean(Request $request)
    {
        $this->authorize('activity_logs.delete');

        $days = config('activitylog.delete_records_older_than_days', 365);

        $deleted = Activity::where('created_at', '<', now()->subDays($days))->delete();

        return redirect()->back()->with('success', "Deleted {$deleted} activity log records older than {$days} days.");
    }

    /**
     * Export activity logs.
     */
    public function export(Request $request)
    {
        $this->authorize('activity_logs.export');

        $query = Activity::with(['causer', 'subject'])
            ->latest();

        // Apply same filters as index
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }
        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->subject_type);
        }
        if ($request->filled('description')) {
            $query->where('description', 'like', '%' . $request->description . '%');
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->get()->map(function ($activity) {
            return [
                'ID' => $activity->id,
                'Log Name' => $activity->log_name ?? 'N/A',
                'Description' => $activity->description,
                'Subject Type' => $activity->subject_type ? class_basename($activity->subject_type) : 'N/A',
                'Subject ID' => $activity->subject_id ?? 'N/A',
                'Causer' => $activity->causer ? $activity->causer->name : 'System',
                'Causer Email' => $activity->causer ? $activity->causer->email : 'N/A',
                'Properties' => json_encode($activity->properties),
                'Created At' => $activity->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ActivityLogsExport($activities),
            'activity-logs-' . now()->format('Y-m-d-His') . '.xlsx'
        );
    }
}

