<?php

namespace App\Services;

use App\Contracts\ReportExporterInterface;
use App\Contracts\ReportGeneratorInterface;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Report Service
 *
 * Orchestrates report generation and export
 * Factory Pattern: Creates appropriate report generators and exporters
 */
class ReportService
{
    /**
     * Available report generators
     */
    private array $reportGenerators = [
        'inventory_summary' => \App\Reports\InventorySummaryReport::class,
        'user_assignments' => \App\Reports\UserAssignmentsReport::class,
        'item_history' => \App\Reports\ItemHistoryReport::class,
        'financial' => \App\Reports\FinancialReport::class,
        'maintenance' => \App\Reports\MaintenanceReport::class,
        'disposal' => \App\Reports\DisposalReport::class,
        'utilization' => \App\Reports\UtilizationReport::class,
        'activity' => \App\Reports\ActivityReport::class,
    ];

    /**
     * Available export formats
     */
    private array $exporters = [
        'excel' => ExcelExporter::class,
        'csv' => CsvExporter::class,
        'pdf' => PdfExporter::class,
    ];

    /**
     * Get all available report types
     */
    public function getAvailableReports(): Collection
    {
        return collect($this->reportGenerators)->map(function ($class, $key) {
            $generator = new $class();
            return [
                'key' => $key,
                'name' => $generator->getName(),
                'title' => $generator->getTitle(),
                'description' => $generator->getDescription(),
            ];
        });
    }

    /**
     * Get a report generator instance
     *
     * @throws \Exception
     */
    public function getReportGenerator(string $reportType): ReportGeneratorInterface
    {
        if (!isset($this->reportGenerators[$reportType])) {
            throw new \Exception("Report type '{$reportType}' not found");
        }

        return new $this->reportGenerators[$reportType]();
    }

    /**
     * Generate a report
     */
    public function generate(string $reportType, array $filters = []): array
    {
        $generator = $this->getReportGenerator($reportType);

        $data = $generator->generate($filters);
        $summary = $generator->getSummary($data);

        // Log activity
        activity()
            ->withProperties([
                'report_type' => $reportType,
                'filters' => $filters,
                'record_count' => $data->count(),
            ])
            ->log("Generated {$generator->getTitle()}");

        return [
            'name' => $generator->getName(),
            'title' => $generator->getTitle(),
            'description' => $generator->getDescription(),
            'data' => $data,
            'columns' => $generator->getColumns(),
            'summary' => $summary,
            'filters' => $filters,
            'available_filters' => $generator->getAvailableFilters(),
            'generated_at' => now(),
        ];
    }

    /**
     * Export a report
     *
     * @throws \Exception
     */
    public function export(string $reportType, string $format, array $filters = [])
    {
        if (!isset($this->exporters[$format])) {
            throw new \Exception("Export format '{$format}' not supported");
        }

        $generator = $this->getReportGenerator($reportType);
        $data = $generator->generate($filters);
        $summary = $generator->getSummary($data);

        /** @var ReportExporterInterface $exporter */
        $exporter = new $this->exporters[$format]();

        // Log activity
        activity()
            ->withProperties([
                'report_type' => $reportType,
                'format' => $format,
                'filters' => $filters,
                'record_count' => $data->count(),
            ])
            ->log("Exported {$generator->getTitle()} as {$format}");

        return $exporter->export(
            $generator->getName(),
            $generator->getTitle(),
            $data,
            $generator->getColumns(),
            $summary
        );
    }

    /**
     * Get available export formats
     */
    public function getAvailableFormats(): array
    {
        return array_keys($this->exporters);
    }

    /**
     * Get filters for a specific report
     */
    public function getReportFilters(string $reportType): array
    {
        $generator = $this->getReportGenerator($reportType);
        return $generator->getAvailableFilters();
    }
}
