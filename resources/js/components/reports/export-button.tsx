import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExportFormat } from '@/types/report';
import { Download, FileSpreadsheet, FileText, Table } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ExportButtonProps {
    reportType: string;
    filters: Record<string, any>;
    disabled?: boolean;
}

export function ExportButton({ reportType, filters, disabled = false }: ExportButtonProps) {
    const handleExport = (format: ExportFormat) => {
        router.post(
            `/reports/${reportType}/export`,
            { format, filters },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={disabled}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2 text-red-600" />
                    PDF (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <Table className="h-4 w-4 mr-2 text-blue-600" />
                    CSV (.csv)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
