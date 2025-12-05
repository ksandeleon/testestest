import AppLayout from '@/layouts/app-layout';
import { index as usersIndex } from '@/routes/users';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MoreHorizontal, UserPlus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    is_active: boolean;
    activated_at: string | null;
    deactivated_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    roles: Role[];
}

interface PaginatedUsers {
    data: User[];
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
    users: PaginatedUsers;
}

export default function Index({ users }: Props) {
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [deactivateDialog, setDeactivateDialog] = useState<{
        open: boolean;
        user: User | null;
    }>({ open: false, user: null });
    const [forceReturn, setForceReturn] = useState(false);

    // Reload data when component mounts to ensure fresh data
    useEffect(() => {
        router.reload({ only: ['users'] });
    }, []);

    // Auto-dismiss notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleToggleStatus = (user: User) => {
        if (user.is_active) {
            // Show confirmation dialog for deactivation
            setDeactivateDialog({ open: true, user });
        } else {
            // Activate directly
            router.post(
                `/users/${user.id}/activate`,
                {},
                {
                    onSuccess: () => {
                        setNotification({
                            type: 'success',
                            message: `User "${user.name}" activated successfully.`,
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

    const handleDeactivateConfirm = () => {
        if (!deactivateDialog.user) return;

        router.post(
            `/users/${deactivateDialog.user.id}/deactivate`,
            { force_return_items: forceReturn },
            {
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: `User "${deactivateDialog.user?.name}" deactivated successfully.`,
                    });
                    setDeactivateDialog({ open: false, user: null });
                    setForceReturn(false);
                },
                onError: (errors) => {
                    const errorMessage =
                        errors.error || Object.values(errors)[0];
                    setNotification({
                        type: 'error',
                        message: String(errorMessage),
                    });
                    setDeactivateDialog({ open: false, user: null });
                    setForceReturn(false);
                },
            }
        );
    };

    const handleDelete = (user: User) => {
        if (
            confirm(
                `Are you sure you want to delete "${user.name}"? This action can be undone from the trash.`
            )
        ) {
            router.delete(`/users/${user.id}`, {
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: `User "${user.name}" deleted successfully.`,
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
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Users',
                    href: usersIndex().url,
                },
            ]}
        >
            <Head title="Users" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users
                        </h1>
                        <p className="text-muted-foreground">
                            Manage user accounts and permissions
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/users/trash">
                            <Button variant="outline">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deleted Users
                            </Button>
                        </Link>
                        <Link href="/users/create">
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Create User
                            </Button>
                        </Link>
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

                <div className="rounded-md border">
                    <Table>
                        <TableCaption>
                            A list of all users in the system
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant="secondary"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                                {user.roles.length === 0 && (
                                                    <span className="text-sm text-muted-foreground">
                                                        No roles
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.deleted_at ? (
                                                <Badge variant="destructive">
                                                    Deleted
                                                </Badge>
                                            ) : !user.is_active ? (
                                                <Badge variant="secondary">
                                                    Inactive
                                                </Badge>
                                            ) : user.email_verified_at ? (
                                                <Badge variant="default">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Unverified
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
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
                                                        <Link
                                                            href={`/users/${user.id}`}
                                                        >
                                                            View details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/users/${user.id}/edit`}
                                                        >
                                                            Edit user
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/users/${user.id}/assign-roles-permissions`}
                                                        >
                                                            Manage roles & permissions
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {!user.deleted_at && (
                                                        <>
                                                            {user.is_active ? (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Deactivate user
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Activate user
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            handleDelete(user)
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete user
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
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {users.data.length} of {users.total} users
                        </div>
                        <div className="flex gap-2">
                            {users.links.map((link, index) => (
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

            {/* Deactivate Confirmation Dialog */}
            <AlertDialog
                open={deactivateDialog.open}
                onOpenChange={(open) =>
                    setDeactivateDialog({ ...deactivateDialog, open })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Deactivate User
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate "
                            {deactivateDialog.user?.name}"?
                            {deactivateDialog.user && (
                                <div className="mt-4 space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={forceReturn}
                                            onChange={(e) =>
                                                setForceReturn(
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">
                                            Force return all active item
                                            assignments
                                        </span>
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        If unchecked and the user has active
                                        assignments, the deactivation will
                                        fail.
                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeactivateDialog({
                                    open: false,
                                    user: null,
                                });
                                setForceReturn(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeactivateConfirm}>
                            Deactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
