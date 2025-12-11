import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportCard } from '@/components/reports/report-card';
import { ReportDefinition } from '@/types/report';
import { BarChart3 } from 'lucide-react';

interface Props {
    reports: ReportDefinition[];
}

export default function Index({ reports }: Props) {
    return (
        <>
            <Head title="Reports" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">Reports</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Generate comprehensive reports for inventory, assignments, maintenance, and more
                    </p>
                </div>

                {/* Report Categories */}
                <div className="space-y-6">
                    {/* Inventory Reports */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Reports</CardTitle>
                            <CardDescription>
                                Item tracking, stock levels, and asset management
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {reports
                                    .filter((r) =>
                                        ['inventory_summary', 'item_history', 'utilization'].includes(r.key)
                                    )
                                    .map((report) => (
                                        <ReportCard key={report.key} report={report} />
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operational Reports */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Operational Reports</CardTitle>
                            <CardDescription>
                                Assignments, maintenance, and disposal tracking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {reports
                                    .filter((r) =>
                                        ['user_assignments', 'maintenance', 'disposal'].includes(r.key)
                                    )
                                    .map((report) => (
                                        <ReportCard key={report.key} report={report} />
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial & Audit Reports */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial & Audit Reports</CardTitle>
                            <CardDescription>
                                Financial analysis and activity audit trails
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {reports
                                    .filter((r) => ['financial', 'activity'].includes(r.key))
                                    .map((report) => (
                                        <ReportCard key={report.key} report={report} />
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
