import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilterPanel } from '@/components/reports/filter-panel';
import { ExportButton } from '@/components/reports/export-button';
import { SummaryStats } from '@/components/reports/summary-stats';
import { ReportData } from '@/types/report';
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Props {
    report: ReportData;
    reportType: string;
}

export default function Show({ report, reportType }: Props) {
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>(report.filters || {});

    const handleFilterChange = (key: string, value: unknown) => {
        setFilterValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleApplyFilters = () => {
        router.get(
            `/reports/${reportType}`,
            filterValues as Record<string, string>,
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleResetFilters = () => {
        const defaultFilters: Record<string, unknown> = {};
        Object.entries(report.available_filters).forEach(([key, filter]) => {
            if (filter.default) {
                defaultFilters[key] = filter.default;
            }
        });
        setFilterValues(defaultFilters);
    };

    const handleRefresh = () => {
        router.reload();
    };

    return (
        <>
            <Head title={report.title} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/reports">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold">{report.title}</h1>
                            </div>
                            <p className="text-muted-foreground">{report.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <ExportButton
                            reportType={reportType}
                            filters={filterValues}
                            disabled={report.data.length === 0}
                        />
                    </div>
                </div>

                {/* Report Info */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Report Information</CardTitle>
                                <CardDescription>
                                    Generated on {format(new Date(report.generated_at), 'PPpp')}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Records</p>
                                <p className="text-2xl font-bold">{report.data.length}</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Filters and Summary */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Filters Sidebar */}
                    {Object.keys(report.available_filters).length > 0 && (
                        <div className="lg:col-span-1">
                            <FilterPanel
                                filters={report.available_filters}
                                values={filterValues}
                                onChange={handleFilterChange}
                                onApply={handleApplyFilters}
                                onReset={handleResetFilters}
                            />
                        </div>
                    )}

                    {/* Main Content */}
                    <div
                        className={
                            Object.keys(report.available_filters).length > 0
                                ? 'lg:col-span-3'
                                : 'lg:col-span-4'
                        }
                    >
                        <div className="space-y-6">
                            {/* Summary Stats */}
                            {report.summary && <SummaryStats summary={report.summary} />}

                            {/* Data Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report Data</CardTitle>
                                    <CardDescription>
                                        Showing {report.data.length} record(s)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {report.data.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground">
                                                No data available for the selected filters
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-md border overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {Object.entries(report.columns).map(([key, label]) => (
                                                            <TableHead key={key}>{label}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {report.data.map((row, index) => (
                                                        <TableRow key={index}>
                                                            {Object.keys(report.columns).map((key) => (
                                                                <TableCell key={key}>
                                                                    {formatCellValue(row[key])}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string' || typeof value === 'number') {
        return value.toString();
    }
    return 'N/A';
}

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
