import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MoreHorizontal,
    UserPlus,
    Search,
    Calendar,
    User,
    Package,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Item {
    id: number;
    name: string;
    property_number: string;
    brand?: string;
    model?: string;
}

interface Assignment {
    id: number;
    item: Item;
    user: User;
    assigned_by: User;
    status: string;
    assigned_date: string;
    due_date: string | null;
    returned_date: string | null;
    purpose: string | null;
    condition_on_assignment: string;
    created_at: string;
}

interface PaginatedAssignments {
    data: Assignment[];
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

interface Stats {
    total: number;
    active: number;
    pending: number;
    returned: number;
    overdue: number;
    cancelled: number;
}

interface Filters {
    search?: string;
    status?: string;
}

interface Props {
    assignments: PaginatedAssignments;
    filters: Filters;
    stats: Stats;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
    pending: { label: 'Pending', variant: 'outline', icon: Clock },
    approved: { label: 'Approved', variant: 'secondary', icon: CheckCircle },
    active: { label: 'Active', variant: 'default', icon: CheckCircle },
    returned: { label: 'Returned', variant: 'secondary', icon: CheckCircle },
    cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

export default function Index({ assignments, filters, stats }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get(
            '/assignments',
            {
                search: search || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('all');
        router.get('/assignments');
    };

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this assignment?')) {
            router.post(`/assignments/${id}/cancel`);
        }
    };

    const handleApprove = (id: number) => {
        router.post(`/assignments/${id}/approve`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '/items' },
                { title: 'Assignments', href: '/assignments' },
            ]}
        >
            <Head title="Assignments" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Item Assignments</h1>
                        <p className="text-muted-foreground">
                            Manage item assignments to users
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/assignments/overdue">
                            <Button variant="outline">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Overdue ({stats.overdue})
                            </Button>
                        </Link>
                        <Link href="/assignments/create">
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Assign Item
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total</CardDescription>
                            <CardTitle className="text-3xl">{stats.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending</CardDescription>
                            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Returned</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{stats.returned}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Overdue</CardDescription>
                            <CardTitle className="text-3xl text-red-600">{stats.overdue}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Cancelled</CardDescription>
                            <CardTitle className="text-3xl text-gray-600">{stats.cancelled}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by item name, user, or property number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button onClick={handleFilter} className="flex-1">
                            Filter
                        </Button>
                        <Button onClick={handleReset} variant="outline">
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableCaption>A list of all item assignments</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Assigned By</TableHead>
                                <TableHead>Assigned Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <UserPlus className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-lg font-medium">No assignments yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Start assigning items to users
                                            </p>
                                            <Link href="/assignments/create" className="mt-2">
                                                <Button>
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Create Assignment
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.data.map((assignment) => {
                                    const statusInfo = statusConfig[assignment.status];
                                    const StatusIcon = statusInfo.icon;
                                    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date() && assignment.status === 'active';

                                    return (
                                        <TableRow key={assignment.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        {assignment.item.brand} {assignment.item.model || assignment.item.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {assignment.item.property_number}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{assignment.user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{assignment.user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{assignment.assigned_by.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(assignment.assigned_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {assignment.due_date ? (
                                                    <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                        {isOverdue && (
                                                            <Badge variant="destructive" className="ml-1">Overdue</Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No due date</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm max-w-xs truncate">
                                                    {assignment.purpose || <span className="text-muted-foreground">—</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/assignments/${assignment.id}`}>
                                                                View details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {assignment.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleApprove(assignment.id)}>
                                                                    Approve assignment
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/assignments/${assignment.id}/edit`}>
                                                                        Edit assignment
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {assignment.status === 'active' && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/returns/create?assignment_id=${assignment.id}`}>
                                                                    Process return
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        {(assignment.status === 'pending' || assignment.status === 'active') && (
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleCancel(assignment.id)}
                                                            >
                                                                Cancel assignment
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {assignments.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {assignments.data.length} of {assignments.total} assignments
                        </div>
                        <div className="flex gap-2">
                            {assignments.links.map((link) => (
                                <Button
                                    key={link.label}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url}>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
