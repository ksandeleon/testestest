import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Trash2, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Activity {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: Record<string, any> | null;
    created_at: string;
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

interface PaginatedActivities {
    data: Activity[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Filters {
    log_name?: string;
    causer_id?: string;
    subject_type?: string;
    description?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    activities: PaginatedActivities;
    filters: Filters;
    logNames: string[];
    subjectTypes: string[];
}

export default function Index({ activities, filters, logNames, subjectTypes }: Props) {
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const applyFilters = () => {
        router.get('/activity-logs', localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get('/activity-logs', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        router.get('/activity-logs/export', localFilters, {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: 'Activity logs exported successfully.',
                });
            },
            onError: (errors) => {
                const errorMessage = errors.error || Object.values(errors)[0];
                setNotification({
                    type: 'error',
                    message: String(errorMessage),
                });
            },
        });
    };

    const handleClean = () => {
        if (
            confirm(
                'Are you sure you want to clean old activity logs? This will delete all logs older than the retention period.'
            )
        ) {
            router.post(
                '/activity-logs/clean',
                {},
                {
                    onSuccess: () => {
                        setNotification({
                            type: 'success',
                            message: 'Old activity logs cleaned successfully.',
                        });
                    },
                    onError: (errors) => {
                        const errorMessage =
                            errors.error || Object.values(errors)[0];
                        setNotification({
                            type: 'error',
                            message: String(errorMessage),
                        });
                    },
                }
            );
        }
    };

    const getSubjectTypeBadgeVariant = (type: string | null) => {
        if (!type) return 'secondary';
        const baseType = type.split('\\').pop();
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
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
            <Head title="Activity Logs" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Activity Logs
                        </h1>
                        <p className="text-muted-foreground">
                            View and manage system activity logs
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="destructive" onClick={handleClean}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clean Old Logs
                        </Button>
                    </div>
                </div>

                {notification && (
                    <Alert
                        variant={
                            notification.type === 'error'
                                ? 'destructive'
                                : 'default'
                        }
                    >
                        <AlertDescription>
                            {notification.message}
                        </AlertDescription>
                    </Alert>
                )}

                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Log Name</Label>
                                    <Select
                                        value={localFilters.log_name || ''}
                                        onValueChange={(value) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                log_name: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All</SelectItem>
                                            {logNames.map((name) => (
                                                <SelectItem
                                                    key={name}
                                                    value={name}
                                                >
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Subject Type</Label>
                                    <Select
                                        value={localFilters.subject_type || ''}
                                        onValueChange={(value) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                subject_type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All</SelectItem>
                                            {subjectTypes.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={localFilters.description || ''}
                                        onChange={(e) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Search description..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Date From</Label>
                                    <Input
                                        type="date"
                                        value={localFilters.date_from || ''}
                                        onChange={(e) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                date_from: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Date To</Label>
                                    <Input
                                        type="date"
                                        value={localFilters.date_to || ''}
                                        onChange={(e) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                date_to: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableCaption>
                            Showing {activities.data.length} of{' '}
                            {activities.total} activity logs
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Log Name</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        No activity logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activities.data.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell className="font-medium">
                                            {new Date(
                                                activity.created_at
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {activity.causer
                                                ? activity.causer.name
                                                : 'System'}
                                        </TableCell>
                                        <TableCell>
                                            {activity.description}
                                        </TableCell>
                                        <TableCell>
                                            {activity.subject_type ? (
                                                <Badge
                                                    variant={getSubjectTypeBadgeVariant(
                                                        activity.subject_type
                                                    )}
                                                >
                                                    {activity.subject_type
                                                        .split('\\')
                                                        .pop()}{' '}
                                                    #{activity.subject_id}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    N/A
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {activity.log_name || 'default'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    router.visit(
                                                        `/activity-logs/${activity.id}`
                                                    )
                                                }
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {activities.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
