<?php

namespace App\Contracts;

use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Interface for report exporters
 *
 * Strategy Pattern: Different export formats implement this interface
 */
interface ReportExporterInterface
{
    /**
     * Export the report data
     *
     * @param string $reportName Report identifier
     * @param string $reportTitle Display title
     * @param Collection $data Report data
     * @param array $columns Column definitions
     * @param array $summary Summary data
     * @return BinaryFileResponse
     */
    public function export(
        string $reportName,
        string $reportTitle,
        Collection $data,
        array $columns,
        array $summary = []
    ): BinaryFileResponse;

    /**
     * Get the export format (excel, pdf, csv)
     */
    public function getFormat(): string;

    /**
     * Get the file extension
     */
    public function getExtension(): string;

    /**
     * Get the MIME type
     */
    public function getMimeType(): string;
}
