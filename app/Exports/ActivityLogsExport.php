<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ActivityLogsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    protected Collection $activities;

    public function __construct(Collection $activities)
    {
        $this->activities = $activities;
    }

    /**
     * Return the collection to export
     */
    public function collection()
    {
        return $this->activities;
    }

    /**
     * Define headings
     */
    public function headings(): array
    {
        return [
            'ID',
            'Log Name',
            'Description',
            'Subject Type',
            'Subject ID',
            'Causer',
            'Causer Email',
            'Properties',
            'Created At',
        ];
    }

    /**
     * Style the worksheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
