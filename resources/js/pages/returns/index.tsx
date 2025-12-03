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
    PackageOpen,
    Search,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    XCircle
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

interface Assignment {
    id: number;
    item: Item;
    user: User;
}

interface ItemReturn {
    id: number;
    assignment: Assignment;
    returned_by: User;
    inspected_by?: User;
    status: string;
    return_date: string;
    inspection_date: string | null;
    condition_on_return: string;
    is_damaged: boolean;
    is_late: boolean;
    days_late: number;
    penalty_amount: number | null;
}

interface PaginatedReturns {
    data: ItemReturn[];
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
    pending_inspection: number;
    approved: number;
    rejected: number;
    damaged: number;
    late: number;
}

interface Filters {
    search?: string;
    status?: string;
}

interface Props {
    returns: PaginatedReturns;
    filters: Filters;
    stats: Stats;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
    pending_inspection: { label: 'Pending Inspection', variant: 'outline', icon: Clock },
    approved: { label: 'Approved', variant: 'default', icon: CheckCircle },
    rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
};

export default function Index({ returns, filters, stats }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get(
            '/returns',
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
        router.get('/returns');
    };

    const handleInspect = (id: number) => {
        router.get(`/returns/${id}/inspect`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '/items' },
                { title: 'Returns', href: '/returns' },
            ]}
        >
            <Head title="Returns" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Item Returns</h1>
                        <p className="text-muted-foreground">
                            Manage item returns and inspections
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/returns/pending-inspections">
                            <Button variant="outline">
                                <Clock className="mr-2 h-4 w-4" />
                                Pending ({stats.pending_inspection})
                            </Button>
                        </Link>
                        <Link href="/returns/damaged">
                            <Button variant="outline">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Damaged ({stats.damaged})
                            </Button>
                        </Link>
                        <Link href="/returns/create">
                            <Button>
                                <PackageOpen className="mr-2 h-4 w-4" />
                                Process Return
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
                            <CardDescription>Pending</CardDescription>
                            <CardTitle className="text-3xl text-yellow-600">{stats.pending_inspection}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Approved</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Rejected</CardDescription>
                            <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Damaged</CardDescription>
                            <CardTitle className="text-3xl text-orange-600">{stats.damaged}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Late</CardDescription>
                            <CardTitle className="text-3xl text-purple-600">{stats.late}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by item or user..."
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
                            <SelectItem value="pending_inspection">Pending Inspection</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
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
                        <TableCaption>A list of all item returns</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Returned By</TableHead>
                                <TableHead>Return Date</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Issues</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {returns.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-lg font-medium">No returns yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Returns will appear here once items are returned
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                returns.data.map((returnItem) => {
                                    const statusInfo = statusConfig[returnItem.status];
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <TableRow key={returnItem.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {returnItem.assignment.item.brand} {returnItem.assignment.item.model || returnItem.assignment.item.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {returnItem.assignment.item.property_number}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{returnItem.returned_by.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(returnItem.return_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={returnItem.is_damaged ? 'destructive' : 'secondary'}>
                                                    {returnItem.condition_on_return}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {returnItem.is_damaged && (
                                                        <Badge variant="destructive">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Damaged
                                                        </Badge>
                                                    )}
                                                    {returnItem.is_late && (
                                                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {returnItem.days_late} day{returnItem.days_late > 1 ? 's' : ''} late
                                                        </Badge>
                                                    )}
                                                    {!returnItem.is_damaged && !returnItem.is_late && (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
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
                                                            <Link href={`/returns/${returnItem.id}`}>
                                                                View details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {returnItem.status === 'pending_inspection' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleInspect(returnItem.id)}>
                                                                    Inspect return
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
                {returns.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {returns.data.length} of {returns.total} returns
                        </div>
                        <div className="flex gap-2">
                            {returns.links.map((link) => (
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
