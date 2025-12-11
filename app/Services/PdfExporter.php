<?php

namespace App\Services;

use App\Contracts\ReportExporterInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * PDF Report Exporter
 *
 * Exports reports to PDF format
 */
class PdfExporter implements ReportExporterInterface
{
    public function export(
        string $reportName,
        string $reportTitle,
        Collection $data,
        array $columns,
        array $summary = []
    ): BinaryFileResponse {
        $filename = $this->generateFilename($reportName);

        $pdf = Pdf::loadView('reports.pdf', [
            'title' => $reportTitle,
            'data' => $data,
            'columns' => $columns,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ]);

        return $pdf->download($filename);
    }

    public function getFormat(): string
    {
        return 'pdf';
    }

    public function getExtension(): string
    {
        return 'pdf';
    }

    public function getMimeType(): string
    {
        return 'application/pdf';
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
