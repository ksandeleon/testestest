import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as usersIndex, create as usersCreate, trash as usersTrash } from '@/routes/users';
import { index as itemsIndex, create as itemsCreate } from '@/routes/items';
import { index as maintenanceIndex, create as maintenanceCreate, calendar as maintenanceCalendar } from '@/routes/maintenance';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, Users, UserPlus, PackagePlus, List, Trash2, Wrench, Plus, Calendar } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/use-permissions';

export function AppSidebar() {
    const { hasPermission, hasAnyPermission } = usePermissions();

    // Build navigation items based on permissions
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        // User Management - show if user has ANY user permission
        ...(hasAnyPermission(['users.view_any', 'users.create', 'users.view']) ? [{
            title: 'User Management',
            href: '#',
            icon: Users,
            items: [
                ...(hasPermission('users.view_any') ? [{
                    title: 'All Users',
                    href: usersIndex(),
                    icon: List,
                }] : []),
                ...(hasPermission('users.create') ? [{
                    title: 'Add User',
                    href: usersCreate(),
                    icon: UserPlus,
                }] : []),
                ...(hasPermission('users.view_any') ? [{
                    title: 'Deleted Users',
                    href: usersTrash(),
                    icon: Trash2,
                }] : []),
            ],
        }] : []),
        // Item Management - show if user has ANY item permission
        ...(hasAnyPermission(['items.view_any', 'items.create', 'items.view']) ? [{
            title: 'Item Management',
            href: '#',
            icon: Package,
            items: [
                ...(hasPermission('items.view_any') ? [{
                    title: 'All Items',
                    href: itemsIndex(),
                    icon: List,
                }] : []),
                ...(hasPermission('items.create') ? [{
                    title: 'Add Item',
                    href: itemsCreate(),
                    icon: PackagePlus,
                }] : []),
            ],
        }] : []),
        // Maintenance - show if user has ANY maintenance permission
        ...(hasAnyPermission(['maintenance.view_any', 'maintenance.create', 'maintenance.view']) ? [{
            title: 'Maintenance',
            href: '#',
            icon: Wrench,
            items: [
                ...(hasPermission('maintenance.view_any') ? [{
                    title: 'All Maintenance',
                    href: maintenanceIndex(),
                    icon: List,
                }] : []),
                ...(hasPermission('maintenance.create') ? [{
                    title: 'Create Request',
                    href: maintenanceCreate(),
                    icon: Plus,
                }] : []),
                ...(hasPermission('maintenance.view_any') ? [{
                    title: 'Calendar',
                    href: maintenanceCalendar(),
                    icon: Calendar,
                }] : []),
            ],
        }] : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
