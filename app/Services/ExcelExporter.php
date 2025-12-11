<?php

namespace App\Services;

use App\Contracts\ReportExporterInterface;
use App\Exports\ReportExport;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Excel Report Exporter
 *
 * Exports reports to Excel format (.xlsx)
 */
class ExcelExporter implements ReportExporterInterface
{
    public function export(
        string $reportName,
        string $reportTitle,
        Collection $data,
        array $columns,
        array $summary = []
    ): BinaryFileResponse {
        $filename = $this->generateFilename($reportName);

        return Excel::download(
            new ReportExport($data, $columns, $reportTitle, $summary),
            $filename
        );
    }

    public function getFormat(): string
    {
        return 'excel';
    }

    public function getExtension(): string
    {
        return 'xlsx';
    }

    public function getMimeType(): string
    {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    /**
     * Generate filename with timestamp
     */
    private function generateFilename(string $reportName): string
    {
        $timestamp = now()->format('Y-m-d_His');
        return "{$reportName}_{$timestamp}.{$this->getExtension()}";
    }
}
