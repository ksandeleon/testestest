import AppLayout from '@/layouts/app-layout';
import {
    index as usersIndex,
    edit as usersEdit,
    destroy as usersDestroy,
    assignRolesPermissions,
} from '@/routes/users';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Mail,
    Calendar,
    Shield,
    Key,
    UserCog,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Role {
    id: number;
    name: string;
}

interface Permission {
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
    permissions: Permission[];
}

interface Props {
    user: User;
}

export default function Show({ user }: Props) {
    const handleDelete = () => {
        router.delete(usersDestroy({ user: user.id }).url);
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Users',
                    href: usersIndex().url,
                },
                {
                    title: user.name,
                    href: '#',
                },
            ]}
        >
            <Head title={user.name} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={usersIndex().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-muted-foreground">
                                User details and permissions
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={assignRolesPermissions(user.id).url}>
                            <Button variant="default">
                                <UserCog className="mr-2 h-4 w-4" />
                                Manage Roles & Permissions
                            </Button>
                        </Link>
                        <Link href={usersEdit({ user: user.id }).url}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will delete the user {user.name}.
                                        This action can be reversed later.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>
                                Basic details about this user
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                                {user.email_verified_at ? (
                                    <Badge variant="default">Verified</Badge>
                                ) : (
                                    <Badge variant="outline">Unverified</Badge>
                                )}
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Created
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Last Updated
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            user.updated_at,
                                        ).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Roles
                                    </CardTitle>
                                    <CardDescription>
                                        Assigned roles for this user
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <Badge
                                            key={role.id}
                                            variant="secondary"
                                            className="text-sm"
                                        >
                                            {role.name
                                                .split('_')
                                                .map(
                                                    (word) =>
                                                        word.charAt(0).toUpperCase() +
                                                        word.slice(1),
                                                )
                                                .join(' ')}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No roles assigned
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Permissions
                                </CardTitle>
                                <CardDescription>
                                    All permissions granted to this user
                                    (includes role permissions)
                                </CardDescription>
                            </div>
                            <Badge variant="outline">
                                {user.permissions.length} total
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {user.permissions.length > 0 ? (
                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {user.permissions.map((permission) => (
                                    <Badge
                                        key={permission.id}
                                        variant="outline"
                                        className="justify-start"
                                    >
                                        {permission.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No permissions assigned
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
