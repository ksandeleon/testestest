import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportDefinition } from '@/types/report';
import { BarChart3, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface ReportCardProps {
    readonly report: ReportDefinition;
}

export function ReportCard({ report }: ReportCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>{report.title}</CardTitle>
                            <CardDescription className="mt-1">
                                {report.description}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Link href={`/reports/${report.key}`}>
                    <Button className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
