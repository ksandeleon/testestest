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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MoreHorizontal, Plus, Search, Tag, Edit, Trash2, RotateCcw, Power, Package, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    items_count: number;
    created_at: string;
    deleted_at?: string;
}

interface PaginatedCategories {
    data: Category[];
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
}

interface Filters {
    search?: string;
    is_active?: string;
    with_trashed?: string;
}

interface Props {
    categories: PaginatedCategories;
    statistics: Statistics;
    filters: Filters;
}

export default function Index({ categories, statistics, filters }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.is_active || undefined);
    const [trashedFilter, setTrashedFilter] = useState(filters.with_trashed || undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const applyFilters = () => {
        router.get(
            '/categories',
            {
                search: search || undefined,
                is_active: statusFilter || undefined,
                with_trashed: trashedFilter || undefined,
            },
            { preserveState: true }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter(undefined);
        setTrashedFilter(undefined);
        router.get('/categories');
    };

    const handleDelete = (id: number) => {
        router.delete(`/categories/${id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setDeletingId(null);
                setNotification({ type: 'success', message: 'Category deleted successfully!' });
                setTimeout(() => setNotification(null), 5000);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                setDeletingId(null);
                const errorMessage = errors.error || Object.values(errors)[0] || 'Failed to delete category';
                setNotification({ type: 'error', message: errorMessage as string });
                setTimeout(() => setNotification(null), 5000);
            },
        });
    };

    const handleRestore = (id: number) => {
        router.post(`/categories/${id}/restore`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNotification({ type: 'success', message: 'Category restored successfully!' });
                setTimeout(() => setNotification(null), 5000);
            },
            onError: (errors) => {
                console.error('Restore error:', errors);
                const errorMessage = errors.error || Object.values(errors)[0] || 'Failed to restore category';
                setNotification({ type: 'error', message: errorMessage as string });
                setTimeout(() => setNotification(null), 5000);
            },
        });
    };

    const handleToggleStatus = (id: number) => {
        router.post(`/categories/${id}/toggle-status`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNotification({ type: 'success', message: 'Category status updated successfully!' });
                setTimeout(() => setNotification(null), 5000);
            },
            onError: (errors) => {
                console.error('Toggle status error:', errors);
                const errorMessage = errors.error || Object.values(errors)[0] || 'Failed to update category status';
                setNotification({ type: 'error', message: errorMessage as string });
                setTimeout(() => setNotification(null), 5000);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '#' },
                { title: 'Categories', href: '/categories' },
            ]}
        >
            <Head title="Categories" />

            <div className="space-y-6">
                {/* Notification Alert */}
                {notification && (
                    <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="relative">
                        {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                        {notification.type === 'error' && <AlertCircle className="h-4 w-4" />}
                        <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                        <AlertDescription>{notification.message}</AlertDescription>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-6 w-6 p-0"
                            onClick={() => setNotification(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </Alert>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground">
                            Manage item categories and classifications
                        </p>
                    </div>
                    <Link href="/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
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
                        <CardDescription>Filter categories by search, status, or deleted state</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="pl-9"
                                />
                            </div>
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
                                    <TableHead>Description</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.data.map((category) => (
                                        <TableRow key={category.id} className={category.deleted_at ? 'opacity-50' : ''}>
                                            <TableCell className="font-mono font-semibold">{category.code}</TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {category.description || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {category.items_count} items
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {category.deleted_at ? (
                                                    <Badge variant="destructive">Deleted</Badge>
                                                ) : category.is_active ? (
                                                    <Badge variant="default">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(category.created_at).toLocaleDateString()}
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
                                                        {!category.deleted_at && (
                                                            <>
                                                                <Link href={`/categories/${category.id}/edit`}>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                <DropdownMenuItem onClick={() => handleToggleStatus(category.id)}>
                                                                    <Power className="mr-2 h-4 w-4" />
                                                                    {category.is_active ? 'Deactivate' : 'Activate'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeletingId(category.id)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {category.deleted_at && (
                                                            <DropdownMenuItem onClick={() => handleRestore(category.id)}>
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
                {categories.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {categories.links.map((link, index) => (
                            <Button
                                key={index}
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
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will soft delete the category. You can restore it later if needed.
                            Categories with items cannot be deleted.
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
