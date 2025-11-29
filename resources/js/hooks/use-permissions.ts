import { usePage } from '@inertiajs/react';

interface Auth {
    user: any;
    permissions: string[];
    roles: string[];
}

interface PageProps {
    auth: Auth;
}

export function usePermissions() {
    const { auth } = usePage<PageProps>().props;

    const hasPermission = (permission: string): boolean => {
        if (!auth.user) return false;

        // Superadmin has all permissions
        if (auth.roles?.includes('superadmin')) return true;

        return auth.permissions?.includes(permission) || false;
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!auth.user) return false;

        // Superadmin has all permissions
        if (auth.roles?.includes('superadmin')) return true;

        return permissions.some(permission => auth.permissions?.includes(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!auth.user) return false;

        // Superadmin has all permissions
        if (auth.roles?.includes('superadmin')) return true;

        return permissions.every(permission => auth.permissions?.includes(permission));
    };

    const hasRole = (role: string): boolean => {
        if (!auth.user) return false;
        return auth.roles?.includes(role) || false;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        if (!auth.user) return false;
        return roles.some(role => auth.roles?.includes(role));
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        permissions: auth.permissions || [],
        roles: auth.roles || [],
    };
}
