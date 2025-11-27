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
import { MoreHorizontal, PackagePlus, QrCode, Search } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Location {
    id: number;
    name: string;
}

interface AccountablePerson {
    id: number;
    name: string;
    email: string;
}

interface Item {
    id: number;
    iar_number: string;
    property_number: string;
    name: string;
    description: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    acquisition_cost: string;
    status: string;
    condition: string;
    qr_code: string | null;
    category: Category;
    location: Location;
    accountable_person: AccountablePerson | null;
    created_at: string;
}

interface PaginatedItems {
    data: Item[];
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
    search?: string;
    category?: string;
    location?: string;
    status?: string;
    condition?: string;
}

interface Props {
    items: PaginatedItems;
    categories: Category[];
    locations: Location[];
    filters: Filters;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    available: 'default',
    assigned: 'secondary',
    in_use: 'secondary',
    in_maintenance: 'outline',
    for_disposal: 'destructive',
    disposed: 'destructive',
    lost: 'destructive',
    damaged: 'destructive',
};

const conditionColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    excellent: 'default',
    good: 'default',
    fair: 'outline',
    poor: 'destructive',
    for_repair: 'destructive',
    unserviceable: 'destructive',
};

export default function Index({ items, categories, locations, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [locationFilter, setLocationFilter] = useState(filters.location || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [conditionFilter, setConditionFilter] = useState(filters.condition || 'all');

    const handleFilter = () => {
        router.get(
            '/items',
            {
                search: search || undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                location: locationFilter !== 'all' ? locationFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                condition: conditionFilter !== 'all' ? conditionFilter : undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setCategoryFilter('all');
        setLocationFilter('all');
        setStatusFilter('all');
        setConditionFilter('all');
        router.get('/items');
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Items',
                    href: '/items',
                },
            ]}
        >
            <Head title="Items" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Items
                        </h1>
                        <p className="text-muted-foreground">
                            Manage property items and equipment
                        </p>
                    </div>
                    <Link href="/items/create">
                        <Button>
                            <PackagePlus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <Select value={categoryFilter || 'all'} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={locationFilter || 'all'} onValueChange={(value) => setLocationFilter(value === 'all' ? '' : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id.toString()}>
                                    {location.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_use">In Use</SelectItem>
                            <SelectItem value="in_maintenance">In Maintenance</SelectItem>
                            <SelectItem value="for_disposal">For Disposal</SelectItem>
                            <SelectItem value="disposed">Disposed</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
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

                <div className="rounded-md border">
                    <Table>
                        <TableCaption>
                            A list of all items in the inventory
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Property #</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center py-12"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <PackagePlus className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-lg font-medium">No items yet!</p>
                                            <p className="text-sm text-muted-foreground">
                                                Get started by adding your first item to the inventory
                                            </p>
                                            <Link href="/items/create" className="mt-2">
                                                <Button>
                                                    <PackagePlus className="mr-2 h-4 w-4" />
                                                    Add Your First Item
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-sm">
                                            {item.property_number}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {item.brand} {item.model || item.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.description.length > 50
                                                        ? item.description.substring(0, 50) + '...'
                                                        : item.description}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.category.name}</TableCell>
                                        <TableCell>{item.location.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusColors[item.status]}>
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={conditionColors[item.condition]}>
                                                {item.condition}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            ₱{parseFloat(item.acquisition_cost).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Open menu
                                                        </span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/items/${item.id}`}>
                                                            View details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/items/${item.id}/edit`}>
                                                            Edit item
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/items/${item.id}/history`}>
                                                            View history
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {!item.qr_code && (
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/items/${item.id}/generate-qr`}
                                                                method="post"
                                                                as="button"
                                                            >
                                                                <QrCode className="mr-2 h-4 w-4" />
                                                                Generate QR Code
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {item.qr_code && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/items/${item.id}/print-qr`}>
                                                                <QrCode className="mr-2 h-4 w-4" />
                                                                Print QR Code
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/items/${item.id}`}
                                                            method="delete"
                                                            as="button"
                                                        >
                                                            Delete item
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {items.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {items.data.length} of {items.total} items
                        </div>
                        <div className="flex gap-2">
                            {items.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url}>
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Link>
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
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
