import AppLayout from '@/layouts/app-layout';
import { index as maintenanceIndex, edit as maintenanceEdit, start as maintenanceStart, complete as maintenanceComplete } from '@/routes/maintenance';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Play, CheckCircle2 } from 'lucide-react';

interface Item {
    id: number;
    name: string;
    property_number: string;
    brand: string;
    model: string;
    category: { name: string };
    location: { name: string };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Maintenance {
    id: number;
    title: string;
    description: string;
    issue_reported: string | null;
    action_taken: string | null;
    recommendations: string | null;
    maintenance_type: string;
    status: string;
    priority: string;
    estimated_cost: string | null;
    actual_cost: string | null;
    cost_approved: boolean;
    scheduled_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    estimated_duration: number | null;
    actual_duration: number | null;
    item: Item;
    assigned_to: User | null;
    requested_by: User;
    approved_by: User | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    maintenance: Maintenance;
}

export default function Show({ maintenance }: Props) {
    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'secondary',
            scheduled: 'default',
            in_progress: 'warning',
            completed: 'success',
            cancelled: 'destructive',
        };
        return colors[status as keyof typeof colors] || 'secondary';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'secondary',
            medium: 'default',
            high: 'warning',
            critical: 'destructive',
        };
        return colors[priority as keyof typeof colors] || 'secondary';
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStart = () => {
        if (confirm('Start this maintenance task?')) {
            router.post(maintenanceStart(maintenance.id).url, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Maintenance: ${maintenance.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={maintenanceIndex()}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">{maintenance.title}</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Maintenance Request #{maintenance.id}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {maintenance.status === 'scheduled' && (
                            <Button onClick={handleStart}>
                                <Play className="mr-2 h-4 w-4" />
                                Start Maintenance
                            </Button>
                        )}
                        {maintenance.status !== 'completed' && (
                            <Button variant="outline" asChild>
                                <Link href={maintenanceEdit(maintenance.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2">
                    <Badge variant={getStatusColor(maintenance.status) as any}>
                        {maintenance.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getPriorityColor(maintenance.priority) as any}>
                        {maintenance.priority} Priority
                    </Badge>
                    <Badge variant="outline">{maintenance.maintenance_type}</Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Main Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm">{maintenance.description}</p>
                            </div>

                            {maintenance.issue_reported && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Issue Reported</p>
                                    <p className="text-sm">{maintenance.issue_reported}</p>
                                </div>
                            )}

                            {maintenance.action_taken && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Action Taken</p>
                                    <p className="text-sm">{maintenance.action_taken}</p>
                                </div>
                            )}

                            {maintenance.recommendations && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                                    <p className="text-sm">{maintenance.recommendations}</p>
                                </div>
                            )}

                            {maintenance.notes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm">{maintenance.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Item & Assignment */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Item Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Item</p>
                                    <p className="text-sm font-medium">{maintenance.item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {maintenance.item.brand} {maintenance.item.model}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Property Number</p>
                                    <p className="text-sm">{maintenance.item.property_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                                    <p className="text-sm">{maintenance.item.location.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                                    <p className="text-sm">{maintenance.item.category.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment & Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                                    <p className="text-sm">{maintenance.requested_by.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                                    <p className="text-sm">{maintenance.assigned_to?.name || 'Unassigned'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                                    <p className="text-sm">{formatDate(maintenance.scheduled_date)}</p>
                                </div>
                                {maintenance.started_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Started At</p>
                                        <p className="text-sm">{formatDate(maintenance.started_at)}</p>
                                    </div>
                                )}
                                {maintenance.completed_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                                        <p className="text-sm">{formatDate(maintenance.completed_at)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cost Information */}
                        {(maintenance.estimated_cost || maintenance.actual_cost) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cost Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {maintenance.estimated_cost && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                                            <p className="text-sm">₱{parseFloat(maintenance.estimated_cost).toFixed(2)}</p>
                                        </div>
                                    )}
                                    {maintenance.actual_cost && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Actual Cost</p>
                                            <p className="text-sm">₱{parseFloat(maintenance.actual_cost).toFixed(2)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Cost Approved</p>
                                        <p className="text-sm">{maintenance.cost_approved ? 'Yes' : 'No'}</p>
                                    </div>
                                    {maintenance.approved_by && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                                            <p className="text-sm">{maintenance.approved_by.name}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

Show.layout = (page: React.ReactNode) => page;
