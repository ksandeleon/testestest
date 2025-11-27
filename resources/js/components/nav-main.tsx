import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useEffect, useState } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

function NavGroup({ item }: { item: NavItem }) {
    const page = usePage();
    const storageKey = `sidebar:group:${item.title}`;

    const shouldBeOpenByRoute =
        item.items?.some((sub) => page.url.startsWith(resolveUrl(sub.href))) ?? false;

    const [open, setOpen] = useState<boolean>(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw !== null) return raw === 'true';
        } catch (e) {
            // ignore
        }
        // default expanded
        return true;
    });

    useEffect(() => {
        if (shouldBeOpenByRoute && !open) {
            setOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldBeOpenByRoute]);

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, String(open));
        } catch (e) {
            // ignore
        }
    }, [open]);

    return (
        <Collapsible asChild open={open} onOpenChange={setOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={{ children: item.title }}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={page.url.startsWith(resolveUrl(subItem.href))}
                                >
                                    <Link href={subItem.href} prefetch>
                                        {subItem.icon && <subItem.icon />}
                                        <span>{subItem.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export function NavMain({
    items,
    label,
}: {
    items: NavItem[];
    label?: string;
}) {
    const page = usePage();

    return (
        <SidebarGroup>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) =>
                    item.items && item.items.length > 0 ? (
                        <NavGroup key={item.title} item={item} />
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(resolveUrl(item.href))}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
