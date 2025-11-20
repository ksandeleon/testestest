import AppLayout from '@/layouts/app-layout';
import { index as usersIndex } from '@/routes/users';
import { Head, Link } from '@inertiajs/react';
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
import { MoreHorizontal, UserPlus } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
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
                    <Link href="/users/create">
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </Link>
                </div>

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
                                            ) : user.email_verified_at ? (
                                                <Badge variant="default">
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
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/users/${user.id}`}
                                                            method="delete"
                                                            as="button"
                                                        >
                                                            Delete user
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
        </AppLayout>
    );
}
