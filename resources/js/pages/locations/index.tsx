import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Plus, Search, MapPin, Edit, Trash2, RotateCcw, Power, Package, Building } from 'lucide-react';
import { useState } from 'react';

interface Location {
    id: number;
    name: string;
    code: string;
    building?: string;
    floor?: string;
    room?: string;
    description?: string;
    is_active: boolean;
    items_count: number;
    full_address: string;
    created_at: string;
    deleted_at?: string;
}

interface PaginatedLocations {
    data: Location[];
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

interface Statistics {
    total: number;
    active: number;
    inactive: number;
    deleted: number;
    with_items: number;
    empty: number;
    buildings: number;
}

interface Filters {
    search?: string;
    building?: string;
    is_active?: string;
    with_trashed?: string;
}

interface Props {
    locations: PaginatedLocations;
    statistics: Statistics;
    buildings: string[];
    filters: Filters;
}

export default function Index({ locations, statistics, buildings, filters }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');
    const [buildingFilter, setBuildingFilter] = useState(filters.building || undefined);
    const [statusFilter, setStatusFilter] = useState(filters.is_active || undefined);
    const [trashedFilter, setTrashedFilter] = useState(filters.with_trashed || undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get(
            '/locations',
            {
                search: search || undefined,
                building: buildingFilter || undefined,
                is_active: statusFilter || undefined,
                with_trashed: trashedFilter || undefined,
            },
            { preserveState: true }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setBuildingFilter(undefined);
        setStatusFilter(undefined);
        setTrashedFilter(undefined);
        router.get('/locations');
    };

    const handleDelete = (id: number) => {
        router.delete(`/locations/${id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setDeletingId(null),
        });
    };

    const handleRestore = (id: number) => {
        router.post(`/locations/${id}/restore`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (id: number) => {
        router.post(`/locations/${id}/toggle-status`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '#' },
                { title: 'Locations', href: '/locations' },
            ]}
        >
            <Head title="Locations" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
                        <p className="text-muted-foreground">
                            Manage physical locations and item placements
                        </p>
                    </div>
                    <Link href="/locations/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Location
                        </Button>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <Power className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <Power className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.inactive}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Buildings</CardTitle>
                            <Building className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.buildings}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">With Items</CardTitle>
                            <Package className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.with_items}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Empty</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.empty}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Deleted</CardTitle>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.deleted}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter locations by search, building, status, or deleted state</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search locations..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={buildingFilter} onValueChange={(value) => setBuildingFilter(value === 'all' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Buildings" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Buildings</SelectItem>
                                    {buildings.map((building) => (
                                        <SelectItem key={building} value={building}>
                                            {building}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={trashedFilter} onValueChange={(value) => setTrashedFilter(value === 'all' ? undefined : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Active Only" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Active Only</SelectItem>
                                    <SelectItem value="1">Include Deleted</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={applyFilters} className="flex-1">
                                    Apply
                                </Button>
                                <Button onClick={resetFilters} variant="outline">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No locations found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    locations.data.map((location) => (
                                        <TableRow key={location.id} className={location.deleted_at ? 'opacity-50' : ''}>
                                            <TableCell className="font-mono font-semibold">{location.code}</TableCell>
                                            <TableCell className="font-medium">{location.name}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="text-sm">
                                                    {location.room && <span>Room {location.room}, </span>}
                                                    {location.floor && <span>Floor {location.floor}, </span>}
                                                    {location.building && <span>{location.building}</span>}
                                                    {!location.room && !location.floor && !location.building && '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {location.items_count} items
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {location.deleted_at ? (
                                                    <Badge variant="destructive">Deleted</Badge>
                                                ) : location.is_active ? (
                                                    <Badge variant="default">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(location.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {!location.deleted_at && (
                                                            <>
                                                                <Link href={`/locations/${location.id}`}>
                                                                    <DropdownMenuItem>
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                <Link href={`/locations/${location.id}/edit`}>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                <DropdownMenuItem onClick={() => handleToggleStatus(location.id)}>
                                                                    <Power className="mr-2 h-4 w-4" />
                                                                    {location.is_active ? 'Deactivate' : 'Activate'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeletingId(location.id)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {location.deleted_at && (
                                                            <DropdownMenuItem onClick={() => handleRestore(location.id)}>
                                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                                Restore
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {locations.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {locations.links.map((link, index) => (
                            <Button
                                key={`${link.url}-${index}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Location?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will soft delete the location. You can restore it later if needed.
                            Locations with items cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
