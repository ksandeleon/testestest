import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, FileText, Calendar, Code } from 'lucide-react';

interface Activity {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: {
        attributes?: Record<string, unknown>;
        old?: Record<string, unknown>;
    } | null;
    created_at: string;
    updated_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
    subject?: {
        id: number;
        name?: string;
    };
}

interface Props {
    activity: Activity;
}

export default function Show({ activity }: Props) {
    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const getSubjectTypeBadgeVariant = (
        type: string | null
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (!type) return 'secondary';
        const baseType = type.split('\\').pop();
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'outline'
        > = {
            Item: 'default',
            User: 'secondary',
            Assignment: 'outline',
            Maintenance: 'outline',
            Disposal: 'destructive',
        };
        return variants[baseType || ''] || 'secondary';
    };

    return (
        <AppLayout>
            <Head title={`Activity Log #${activity.id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/activity-logs">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Activity Logs
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight mt-2">
                            Activity Log #{activity.id}
                        </h1>
                        <p className="text-muted-foreground">
                            {activity.description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Performed By
                                </p>
                                <p className="text-lg">
                                    {activity.causer
                                        ? activity.causer.name
                                        : 'System'}
                                </p>
                            </div>
                            {activity.causer && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Email
                                    </p>
                                    <p className="text-lg">
                                        {activity.causer.email}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    User ID
                                </p>
                                <p className="text-lg">
                                    {activity.causer_id || 'N/A'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                Entity Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Subject Type
                                </p>
                                {activity.subject_type ? (
                                    <Badge
                                        variant={getSubjectTypeBadgeVariant(
                                            activity.subject_type
                                        )}
                                        className="mt-1"
                                    >
                                        {activity.subject_type.split('\\').pop()}
                                    </Badge>
                                ) : (
                                    <p className="text-lg text-muted-foreground">
                                        N/A
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Subject ID
                                </p>
                                <p className="text-lg">
                                    {activity.subject_id || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Log Name
                                </p>
                                <p className="text-lg">
                                    {activity.log_name || 'default'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5" />
                                Timestamps
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Created At
                                </p>
                                <p className="text-lg">
                                    {new Date(
                                        activity.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Updated At
                                </p>
                                <p className="text-lg">
                                    {new Date(
                                        activity.updated_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Code className="mr-2 h-5 w-5" />
                                Action
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Description
                                </p>
                                <p className="text-lg font-semibold">
                                    {activity.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {activity.properties && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Changes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activity.properties.old && (
                                    <div>
                                        <h3 className="font-semibold mb-3 text-destructive">
                                            Old Values
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                activity.properties.old
                                            ).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="border-l-4 border-destructive pl-3 py-2"
                                                >
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {key}
                                                    </p>
                                                    <p className="text-sm font-mono bg-destructive/10 p-2 rounded">
                                                        {formatValue(value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activity.properties.attributes && (
                                    <div>
                                        <h3 className="font-semibold mb-3 text-green-600">
                                            New Values
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                activity.properties.attributes
                                            ).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="border-l-4 border-green-600 pl-3 py-2"
                                                >
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {key}
                                                    </p>
                                                    <p className="text-sm font-mono bg-green-50 p-2 rounded">
                                                        {formatValue(value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
