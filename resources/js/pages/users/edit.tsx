import AppLayout from '@/layouts/app-layout';
import { index as usersIndex, update as usersUpdate } from '@/routes/users';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

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
    roles: Role[];
}

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(usersUpdate({ user: user.id }).url);
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
                    href: `/users/${user.id}`,
                },
                {
                    title: 'Edit',
                    href: '#',
                },
            ]}
        >
            <Head title={`Edit ${user.name}`} />

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Link href={usersIndex().url}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit User
                        </h1>
                        <p className="text-muted-foreground">
                            Update user information
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>User Information</CardTitle>
                                <CardDescription>
                                    Update the user's details below
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {user.roles.map((role) => (
                                    <Badge key={role.id} variant="secondary">
                                        {role.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="John Doe"
                                    className={
                                        errors.name ? 'border-red-500' : ''
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="john@example.com"
                                    className={
                                        errors.email ? 'border-red-500' : ''
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        Change Password
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Leave blank to keep current password
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className={
                                            errors.password
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href={usersIndex().url}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Updating...'
                                        : 'Update User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Metadata</CardTitle>
                        <CardDescription>
                            Additional information about this user
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                User ID
                            </span>
                            <span className="text-sm font-medium">
                                {user.id}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Email Verified
                            </span>
                            <span className="text-sm font-medium">
                                {user.email_verified_at ? (
                                    <Badge variant="default">Yes</Badge>
                                ) : (
                                    <Badge variant="outline">No</Badge>
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Created
                            </span>
                            <span className="text-sm font-medium">
                                {new Date(user.created_at).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Last Updated
                            </span>
                            <span className="text-sm font-medium">
                                {new Date(user.updated_at).toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
