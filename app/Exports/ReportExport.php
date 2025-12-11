<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Generic Excel Export
 *
 * Exports report data to Excel format with formatting
 */
class ReportExport implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected Collection $data;
    protected array $columns;
    protected string $title;
    protected array $summary;

    public function __construct(Collection $data, array $columns, string $title, array $summary = [])
    {
        $this->data = $data;
        $this->columns = $columns;
        $this->title = $title;
        $this->summary = $summary;
    }

    /**
     * Return the data collection
     */
    public function collection(): Collection
    {
        // Map data to only include specified columns
        return $this->data->map(function ($row) {
            $mappedRow = [];
            foreach (array_keys($this->columns) as $key) {
                $mappedRow[] = $row[$key] ?? '';
            }
            return $mappedRow;
        });
    }

    /**
     * Return column headings
     */
    public function headings(): array
    {
        return array_values($this->columns);
    }

    /**
     * Return sheet title
     */
    public function title(): string
    {
        return substr($this->title, 0, 31); // Excel sheet name limit
    }

    /**
     * Apply styles to the sheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row (header)
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E2E8F0'],
                ],
            ],
        ];
    }
}
