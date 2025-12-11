<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

/**
 * Interface for all report generators
 *
 * Strategy Pattern: Each report type implements this interface
 * allowing the ReportService to work with any report type polymorphically
 */
interface ReportGeneratorInterface
{
    /**
     * Get the report name/identifier
     */
    public function getName(): string;

    /**
     * Get the report title for display
     */
    public function getTitle(): string;

    /**
     * Get the report description
     */
    public function getDescription(): string;

    /**
     * Generate the report data
     *
     * @param array $filters Filters like date_from, date_to, category_id, etc.
     * @return Collection The report data
     */
    public function generate(array $filters = []): Collection;

    /**
     * Get the columns/fields for the report
     *
     * @return array Array of column definitions ['key' => 'label']
     */
    public function getColumns(): array;

    /**
     * Get summary/totals for the report
     *
     * @param Collection $data The generated report data
     * @return array Summary data (totals, counts, averages, etc.)
     */
    public function getSummary(Collection $data): array;

    /**
     * Get available filter options for this report
     *
     * @return array Filter configuration
     */
    public function getAvailableFilters(): array;
}
