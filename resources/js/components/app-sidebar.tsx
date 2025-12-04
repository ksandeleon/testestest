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
import { index as assignmentsIndex, myAssignments } from '@/routes/assignments';
import { index as returnsIndex, pendingInspections } from '@/routes/returns';
import { index as disposalsIndex, create as disposalsCreate, pending as disposalsPending } from '@/routes/disposals';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, Users, UserPlus, PackagePlus, List, Trash2, Wrench, Plus, Calendar, UserCheck, PackageOpen, ClipboardCheck, ClipboardList } from 'lucide-react';
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
        // Item Assignment - show if user has ANY assignment or return permission
        ...(hasAnyPermission(['assignments.view_any', 'assignments.view_own', 'returns.view_any', 'returns.view_own']) ? [{
            title: 'Item Assignment',
            href: '#',
            icon: ClipboardList,
            items: [
                ...(hasPermission('assignments.view_any') ? [{
                    title: 'All Assignments',
                    href: assignmentsIndex(),
                    icon: UserCheck,
                }] : []),
                // Only show "My Assignments" if user DOESN'T have view_any (staff only)
                ...(!hasPermission('assignments.view_any') && hasPermission('assignments.view_own') ? [{
                    title: 'My Assignments',
                    href: myAssignments(),
                    icon: UserCheck,
                }] : []),
                ...(hasPermission('returns.view_any') ? [{
                    title: 'All Returns',
                    href: returnsIndex(),
                    icon: PackageOpen,
                }] : []),
                ...(hasPermission('returns.view_any') ? [{
                    title: 'Pending Inspections',
                    href: pendingInspections(),
                    icon: ClipboardCheck,
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
        // Disposal - show if user has ANY disposal permission
        ...(hasAnyPermission(['disposals.view_any', 'disposals.create', 'disposals.approve', 'disposals.execute']) ? [{
            title: 'Disposal',
            href: '#',
            icon: Trash2,
            items: [
                ...(hasPermission('disposals.view_any') ? [{
                    title: 'All Disposals',
                    href: disposalsIndex(),
                    icon: List,
                }] : []),
                ...(hasPermission('disposals.create') ? [{
                    title: 'Request Disposal',
                    href: disposalsCreate(),
                    icon: Plus,
                }] : []),
                ...(hasPermission('disposals.approve') ? [{
                    title: 'Pending Approval',
                    href: disposalsPending(),
                    icon: ClipboardCheck,
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
