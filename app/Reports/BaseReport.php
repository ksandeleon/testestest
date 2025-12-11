<?php

namespace App\Reports;

use App\Contracts\ReportGeneratorInterface;
use Carbon\Carbon;

/**
 * Base class for all reports
 *
 * Template Method Pattern: Provides common functionality
 * and enforces structure for concrete report classes
 */
abstract class BaseReport implements ReportGeneratorInterface
{
    /**
     * Parse date from filter
     */
    protected function parseDate(?string $date): ?Carbon
    {
        if (!$date) {
            return null;
        }

        return Carbon::parse($date);
    }

    /**
     * Get date range from filters
     */
    protected function getDateRange(array $filters): array
    {
        $from = $this->parseDate($filters['date_from'] ?? null);
        $to = $this->parseDate($filters['date_to'] ?? null);

        // Default to current month if not specified
        if (!$from && !$to) {
            $from = Carbon::now()->startOfMonth();
            $to = Carbon::now()->endOfMonth();
        }

        return [$from, $to];
    }

    /**
     * Format currency value
     */
    protected function formatCurrency(?float $value): string
    {
        if ($value === null) {
            return '₱0.00';
        }

        return '₱' . number_format($value, 2);
    }

    /**
     * Format percentage
     */
    protected function formatPercentage(float $value): string
    {
        return number_format($value, 2) . '%';
    }

    /**
     * Calculate percentage
     */
    protected function calculatePercentage(float $part, float $total): float
    {
        if ($total == 0) {
            return 0;
        }

        return ($part / $total) * 100;
    }

    /**
     * Get common date range filters
     */
    protected function getCommonDateFilters(): array
    {
        return [
            'date_from' => [
                'type' => 'date',
                'label' => 'From Date',
                'default' => Carbon::now()->startOfMonth()->toDateString(),
            ],
            'date_to' => [
                'type' => 'date',
                'label' => 'To Date',
                'default' => Carbon::now()->endOfMonth()->toDateString(),
            ],
        ];
    }
}
