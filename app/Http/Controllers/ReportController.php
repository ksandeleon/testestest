<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Report Controller
 *
 * Handles report generation and export
 */
class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService
    ) {
    }

    /**
     * Display report dashboard
     */
    public function index(): Response
    {
        $this->authorize('reports.view');

        $availableReports = $this->reportService->getAvailableReports();

        return Inertia::render('reports/index', [
            'reports' => $availableReports,
        ]);
    }

    /**
     * Generate and display a specific report
     */
    public function show(Request $request, string $reportType): Response
    {
        $this->authorize('reports.view');

        $filters = $request->only([
            'date_from', 'date_to', 'category_id', 'location_id',
            'status', 'user_id', 'item_id', 'event', 'maintenance_type',
            'assigned_to', 'disposal_method', 'is_overdue', 'subject_type',
            'causer_id',
        ]);

        $report = $this->reportService->generate($reportType, $filters);

        return Inertia::render('reports/show', [
            'report' => $report,
            'reportType' => $reportType,
            'exportFormats' => $this->reportService->getAvailableFormats(),
        ]);
    }

    /**
     * Export a report
     */
    public function export(Request $request, string $reportType)
    {
        $this->authorize('reports.export');

        $validated = $request->validate([
            'format' => 'required|in:excel,csv,pdf',
            'filters' => 'nullable|array',
        ]);

        $format = $validated['format'];
        $filters = $validated['filters'] ?? [];

        return $this->reportService->export($reportType, $format, $filters);
    }

    /**
     * Get filters for a specific report
     */
    public function filters(string $reportType)
    {
        $this->authorize('reports.view');

        $filters = $this->reportService->getReportFilters($reportType);

        return response()->json(['filters' => $filters]);
    }
}
