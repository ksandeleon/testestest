import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Clock } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Location {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Item {
    id: number;
    property_number: string;
    name: string;
    brand: string | null;
    model: string | null;
    category: Category;
    location: Location;
    accountable_person: User | null;
    creator: User | null;
    updater: User | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    item: Item;
}

export default function History({ item }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Items',
                    href: '/items',
                },
                {
                    title: item.property_number,
                    href: `/items/${item.id}`,
                },
                {
                    title: 'History',
                    href: '#',
                },
            ]}
        >
            <Head title={`Item History - ${item.property_number}`} />

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Link href={`/items/${item.id}`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Item History
                        </h1>
                        <p className="text-muted-foreground">
                            {item.brand} {item.model || item.name} ({item.property_number})
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tracking Timeline</CardTitle>
                        <CardDescription>
                            Complete history of this item's lifecycle
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Current State */}
                            <div className="flex gap-4 border-l-4 border-primary pl-4 py-2">
                                <Clock className="h-5 w-5 text-primary mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold">Current State</p>
                                    <p className="text-sm text-muted-foreground">
                                        Category: {item.category.name} • Location: {item.location.name}
                                    </p>
                                    {item.accountable_person && (
                                        <p className="text-sm text-muted-foreground">
                                            Assigned to: {item.accountable_person.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Last Updated */}
                            {item.updater && (
                                <div className="flex gap-4 border-l-4 border-muted pl-4 py-2">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium">Item Updated</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(item.updated_at).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Updated by: {item.updater.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Created */}
                            <div className="flex gap-4 border-l-4 border-muted pl-4 py-2">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">Item Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(item.created_at).toLocaleString()}
                                    </p>
                                    {item.creator && (
                                        <p className="text-sm text-muted-foreground">
                                            Created by: {item.creator.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Future Feature Notice */}
                        <div className="mt-8 p-4 bg-muted rounded-lg">
                            <h3 className="font-semibold mb-2">Coming Soon</h3>
                            <p className="text-sm text-muted-foreground">
                                Full item history including:
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                                <li>Assignment and transfer history</li>
                                <li>Maintenance and repair records</li>
                                <li>Status and condition changes</li>
                                <li>Location movements</li>
                                <li>Cost adjustments</li>
                                <li>Disposal tracking</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
