import AppLayout from '@/layouts/app-layout';
import { index as maintenanceIndex, show as maintenanceShow, create as maintenanceCreate } from '@/routes/maintenance';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Item {
    id: number;
    name: string;
    property_number: string;
}

interface User {
    id: number;
    name: string;
}

interface Maintenance {
    id: number;
    title: string;
    maintenance_type: string;
    status: string;
    priority: string;
    scheduled_date: string | null;
    item: Item;
    assigned_to: User | null;
    requested_by: User;
    created_at: string;
}

interface PaginatedMaintenances {
    data: Maintenance[];
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

interface Props {
    maintenances: PaginatedMaintenances;
    filters: {
        status?: string;
        type?: string;
        priority?: string;
        search?: string;
    };
}

export default function Index({ maintenances, filters }: Props) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [search, setSearch] = useState(filters.search || '');

    // Reload data when component mounts
    useEffect(() => {
        router.reload({ only: ['maintenances'] });
    }, []);

    const handleFilter = () => {
        router.get(
            maintenanceIndex(),
            {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                search: search || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

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

    const getTypeColor = (type: string) => {
        const colors = {
            preventive: 'default',
            corrective: 'warning',
            predictive: 'secondary',
            emergency: 'destructive',
        };
        return colors[type as keyof typeof colors] || 'secondary';
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not scheduled';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isOverdue = (maintenance: Maintenance) => {
        if (!maintenance.scheduled_date) return false;
        if (maintenance.status === 'completed' || maintenance.status === 'cancelled') return false;
        return new Date(maintenance.scheduled_date) < new Date();
    };

    return (
        <AppLayout header="Maintenance Management">
            <Head title="Maintenance" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Maintenance Records</h1>
                        <p className="text-muted-foreground">
                            Manage and track all maintenance activities
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={maintenanceCreate()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Request
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search maintenance..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFilter();
                                }}
                            />
                        </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="preventive">Preventive</SelectItem>
                            <SelectItem value="corrective">Corrective</SelectItem>
                            <SelectItem value="predictive">Predictive</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFilter}>Filter</Button>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Scheduled Date</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {maintenances.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No maintenance records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                maintenances.data.map((maintenance) => (
                                    <TableRow key={maintenance.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {maintenance.title}
                                                {isOverdue(maintenance) && (
                                                    <AlertCircle className="h-4 w-4 text-destructive" title="Overdue" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{maintenance.item.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {maintenance.item.property_number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getTypeColor(maintenance.maintenance_type) as any}>
                                                {maintenance.maintenance_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(maintenance.status) as any}>
                                                {maintenance.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getPriorityColor(maintenance.priority) as any}>
                                                {maintenance.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={isOverdue(maintenance) ? 'text-destructive font-medium' : ''}>
                                                {formatDate(maintenance.scheduled_date)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {maintenance.assigned_to?.name || (
                                                <span className="text-muted-foreground">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={maintenanceShow(maintenance.id)}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {maintenances.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {maintenances.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

Index.layout = (page: React.ReactNode) => page;
