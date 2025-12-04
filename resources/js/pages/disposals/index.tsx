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
    Trash2,
    Search,
    Calendar,
    Clock,
    Plus,
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface Item {
    id: number;
    name: string;
    property_number: string;
    brand?: string;
    model?: string;
}

interface Disposal {
    id: number;
    item: Item;
    requested_by_user: User;
    approved_by_user?: User;
    executed_by_user?: User;
    status: string;
    reason: string;
    description: string;
    requested_at: string;
    approved_at: string | null;
    executed_at: string | null;
}

interface PaginatedDisposals {
    data: Disposal[];
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
    pending: number;
    approved: number;
    rejected: number;
    executed: number;
}

interface Filters {
    search?: string;
    status?: string;
    reason?: string;
}

interface Props {
    disposals: PaginatedDisposals;
    filters: Filters;
    stats: Stats;
    statuses: string[];
    reasons: string[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'outline' },
    approved: { label: 'Approved', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    executed: { label: 'Executed', variant: 'secondary' },
};

export default function Index({ disposals, filters, stats, statuses, reasons }: Readonly<Props>) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [reasonFilter, setReasonFilter] = useState(filters?.reason || 'all');

    const handleFilter = () => {
        router.get(
            '/disposals',
            {
                search: search || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                reason: reasonFilter === 'all' ? undefined : reasonFilter,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('all');
        setReasonFilter('all');
        router.get('/disposals');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '/items' },
                { title: 'Disposals', href: '/disposals' },
            ]}
        >
            <Head title="Disposals" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Item Disposals</h1>
                        <p className="text-muted-foreground">
                            Manage item disposal requests and execution
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/disposals/pending">
                            <Button variant="outline">
                                <Clock className="mr-2 h-4 w-4" />
                                Pending ({stats?.pending || 0})
                            </Button>
                        </Link>
                        <Link href="/disposals/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Request Disposal
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total</CardDescription>
                            <CardTitle className="text-3xl">{stats?.total || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending</CardDescription>
                            <CardTitle className="text-3xl text-yellow-600">{stats?.pending || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Approved</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats?.approved || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Rejected</CardDescription>
                            <CardTitle className="text-3xl text-red-600">{stats?.rejected || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Executed</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{stats?.executed || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by item or property number..."
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
                            {statuses?.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {statusConfig[status]?.label || status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={reasonFilter} onValueChange={setReasonFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Reasons" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Reasons</SelectItem>
                            {reasons?.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                    {reason.replaceAll('_', ' ')}
                                </SelectItem>
                            ))}
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
                        <TableCaption>A list of all disposal requests</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead>Requested Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!disposals?.data || disposals.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <Trash2 className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-lg font-medium">No disposals yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Disposal requests will appear here
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                disposals.data.map((disposal) => {
                                    const statusInfo = statusConfig[disposal.status] || statusConfig.pending;

                                    return (
                                        <TableRow key={disposal.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {disposal.item.brand} {disposal.item.model || disposal.item.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {disposal.item.property_number}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize">
                                                    {disposal.reason.replaceAll('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{disposal.requested_by_user.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(disposal.requested_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusInfo.variant}>
                                                    {statusInfo.label}
                                                </Badge>
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
                                                            <Link href={`/disposals/${disposal.id}`}>
                                                                View details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {disposal.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/disposals/${disposal.id}/approve`}>
                                                                        Approve/Reject
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {disposal.status === 'approved' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/disposals/${disposal.id}/execute`}>
                                                                        Execute disposal
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </>
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
                {disposals?.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {disposals.data?.length || 0} of {disposals.total || 0} disposals
                        </div>
                        <div className="flex gap-2">
                            {disposals.links?.map((link) => (
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
