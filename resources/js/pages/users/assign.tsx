import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    assignRole, 
    revokeRole, 
    assignPermission, 
    revokePermission,
    show as showUser 
} from '@/routes/users';
import { Shield, UserCog, Award, Lock, Plus, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    permissions: Permission[];
}

interface AssignProps {
    user: User;
    allRoles: Role[];
    allPermissions: Record<string, Permission[]>;
}

export default function Assign({ user, allRoles, allPermissions }: Readonly<AssignProps>) {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedPermission, setSelectedPermission] = useState<string>('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const formatRoleName = (name: string) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatPermissionName = (name: string) => {
        const parts = name.split('.');
        if (parts.length === 2) {
            return parts[1]
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
        return name;
    };

    const formatCategoryName = (category: string) => {
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleAssignRole = () => {
        if (!selectedRole) return;

        router.post(
            assignRole(user.id).url,
            { role: selectedRole },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedRole(''),
            }
        );
    };

    const handleRevokeRole = (roleName: string) => {
        router.post(
            revokeRole(user.id).url,
            { role: roleName },
            {
                preserveScroll: true,
            }
        );
    };

    const handleAssignPermission = () => {
        if (!selectedPermission) return;

        router.post(
            assignPermission(user.id).url,
            { permission: selectedPermission },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedPermission(''),
            }
        );
    };

    const handleRevokePermission = (permissionName: string) => {
        router.post(
            revokePermission(user.id).url,
            { permission: permissionName },
            {
                preserveScroll: true,
            }
        );
    };

    const togglePermissionSelection = (permissionName: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionName)
                ? prev.filter(p => p !== permissionName)
                : [...prev, permissionName]
        );
    };

    const handleBulkAssignPermissions = async () => {
        if (selectedPermissions.length === 0) return;

        // Process permissions sequentially to avoid conflicts
        let completed = 0;
        const total = selectedPermissions.length;

        for (const permission of selectedPermissions) {
            await new Promise<void>((resolve) => {
                router.post(
                    assignPermission(user.id).url,
                    { permission },
                    {
                        preserveScroll: true,
                        preserveState: completed < total - 1, // Only preserve state for non-last requests
                        only: completed < total - 1 ? [] : ['user'], // Only fetch user data on last request
                        onFinish: () => {
                            completed++;
                            resolve();
                        },
                    }
                );
            });
        }

        setSelectedPermissions([]);
    };

    const handleBulkRevokePermissions = async () => {
        if (selectedPermissions.length === 0) return;

        // Process permissions sequentially to avoid conflicts
        let completed = 0;
        const total = selectedPermissions.length;

        for (const permission of selectedPermissions) {
            await new Promise<void>((resolve) => {
                router.post(
                    revokePermission(user.id).url,
                    { permission },
                    {
                        preserveScroll: true,
                        preserveState: completed < total - 1,
                        only: completed < total - 1 ? [] : ['user'],
                        onFinish: () => {
                            completed++;
                            resolve();
                        },
                    }
                );
            });
        }

        setSelectedPermissions([]);
    };

    // Get user's direct permission names
    const userDirectPermissions = new Set(user.permissions.map(p => p.name));
    
    // Get all permissions from user's roles
    const userRolePermissions = new Set(
        user.roles.flatMap(role => role.permissions.map(p => p.name))
    );

    const hasPermission = (permissionName: string) => {
        return userDirectPermissions.has(permissionName) || 
               userRolePermissions.has(permissionName);
    };

    const isDirectPermission = (permissionName: string) => {
        return userDirectPermissions.has(permissionName);
    };

    return (
        <AppLayout>
            <Head title={`Assign Roles & Permissions - ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Shield className="h-8 w-8" />
                            Role & Permission Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage roles and permissions for <span className="font-semibold">{user.name}</span> ({user.email})
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit(showUser(user.id).url)}>
                        Back to User
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Roles Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="h-5 w-5" />
                                Roles
                            </CardTitle>
                            <CardDescription>
                                Assign or revoke roles. Roles provide bundled permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Assign Role */}
                            <div className="space-y-2">
                                <Label>Assign New Role</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allRoles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    {formatRoleName(role.name)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAssignRole} disabled={!selectedRole}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Current Roles */}
                            <div className="space-y-2">
                                <Label>Current Roles ({user.roles.length})</Label>
                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    {user.roles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No roles assigned
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {user.roles.map((role) => (
                                                <div
                                                    key={role.id}
                                                    className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                >
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Award className="h-4 w-4 text-primary" />
                                                            <span className="font-semibold">
                                                                {formatRoleName(role.name)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {role.permissions.length} permissions
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRevokeRole(role.name)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Direct Permissions Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Direct Permissions
                            </CardTitle>
                            <CardDescription>
                                Assign individual permissions directly to the user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Assign Permission */}
                            <div className="space-y-2">
                                <Label>Assign New Permission</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a permission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(allPermissions).map(([category, permissions]) => (
                                                <div key={category}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                        {formatCategoryName(category)}
                                                    </div>
                                                    {permissions.map((permission) => (
                                                        <SelectItem key={permission.id} value={permission.name}>
                                                            {formatPermissionName(permission.name)}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAssignPermission} disabled={!selectedPermission}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Current Direct Permissions */}
                            <div className="space-y-2">
                                <Label>Direct Permissions ({user.permissions.length})</Label>
                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    {user.permissions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No direct permissions assigned
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {user.permissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                                >
                                                    <span className="text-sm font-medium">
                                                        {formatPermissionName(permission.name)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRevokePermission(permission.name)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* All Permissions Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Permissions Overview</CardTitle>
                        <CardDescription>
                            View all available permissions grouped by category. Green badges indicate active permissions 
                            (either from roles or assigned directly). Click to select multiple for bulk operations.
                        </CardDescription>
                        
                        {/* Search Bar */}
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {selectedPermissions.length > 0 && (
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleBulkAssignPermissions} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Assign Selected ({selectedPermissions.length})
                                </Button>
                                <Button 
                                    onClick={handleBulkRevokePermissions} 
                                    size="sm" 
                                    variant="destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Revoke Selected ({selectedPermissions.length})
                                </Button>
                                <Button 
                                    onClick={() => setSelectedPermissions([])} 
                                    size="sm" 
                                    variant="outline"
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Object.entries(allPermissions)
                                .filter(([category]) => {
                                    if (!searchQuery) return true;
                                    return formatCategoryName(category)
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase());
                                })
                                .map(([category, permissions]) => (
                                <div key={category} className="space-y-3">
                                    <h3 className="font-semibold text-lg capitalize border-b pb-2">
                                        {formatCategoryName(category)}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {permissions.map((permission) => {
                                            const isActive = hasPermission(permission.name);
                                            const isDirect = isDirectPermission(permission.name);
                                            const isSelected = selectedPermissions.includes(permission.name);

                                            return (
                                                <button
                                                    type="button"
                                                    key={permission.id}
                                                    className={`flex items-center space-x-2 p-2 rounded-md border transition-colors cursor-pointer ${
                                                        isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                                                    }`}
                                                    onClick={() => togglePermissionSelection(permission.name)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            togglePermissionSelection(permission.name);
                                                        }
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => togglePermissionSelection(permission.name)}
                                                    />
                                                    <div className="flex-1">
                                                        <Badge
                                                            variant={isActive ? 'default' : 'outline'}
                                                            className={`text-xs ${
                                                                isDirect ? 'bg-blue-500' : ''
                                                            }`}
                                                        >
                                                            {formatPermissionName(permission.name)}
                                                            {isDirect && ' (Direct)'}
                                                            {isActive && !isDirect && ' (Role)'}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {Object.entries(allPermissions).filter(([category]) => {
                                if (!searchQuery) return true;
                                return formatCategoryName(category)
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase());
                            }).length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No categories found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
