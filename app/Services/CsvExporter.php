<?php

namespace App\Services;

use App\Contracts\ReportExporterInterface;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * CSV Report Exporter
 *
 * Exports reports to CSV format
 */
class CsvExporter implements ReportExporterInterface
{
    public function export(
        string $reportName,
        string $reportTitle,
        Collection $data,
        array $columns,
        array $summary = []
    ): BinaryFileResponse {
        $filename = $this->generateFilename($reportName);

        $callback = function () use ($data, $columns) {
            $file = fopen('php://output', 'w');

            // Write header
            fputcsv($file, array_values($columns));

            // Write data rows
            foreach ($data as $row) {
                $csvRow = [];
                foreach (array_keys($columns) as $key) {
                    $csvRow[] = $row[$key] ?? '';
                }
                fputcsv($file, $csvRow);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, [
            'Content-Type' => $this->getMimeType(),
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function getFormat(): string
    {
        return 'csv';
    }

    public function getExtension(): string
    {
        return 'csv';
    }

    public function getMimeType(): string
    {
        return 'text/csv';
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
