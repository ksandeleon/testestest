import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Edit, QrCode, History, Trash2 } from 'lucide-react';

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
    iar_number: string;
    property_number: string;
    fund_cluster: string | null;
    name: string;
    description: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    specifications: string | null;
    acquisition_cost: string;
    unit_of_measure: string | null;
    quantity: number;
    category: Category;
    location: Location;
    accountable_person: User | null;
    accountable_person_name: string | null;
    accountable_person_position: string | null;
    date_acquired: string;
    date_inventoried: string | null;
    estimated_useful_life: string | null;
    status: string;
    condition: string;
    qr_code: string | null;
    qr_code_path: string | null;
    remarks: string | null;
    creator: User | null;
    updater: User | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    item: Item;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    available: 'default',
    assigned: 'secondary',
    in_use: 'secondary',
    in_maintenance: 'outline',
    for_disposal: 'destructive',
    disposed: 'destructive',
    lost: 'destructive',
    damaged: 'destructive',
};

const conditionColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    excellent: 'default',
    good: 'default',
    fair: 'outline',
    poor: 'destructive',
    for_repair: 'destructive',
    unserviceable: 'destructive',
};

export default function Show({ item }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this item?')) {
            router.delete(`/items/${item.id}`);
        }
    };

    const handleGenerateQr = () => {
        router.post(`/items/${item.id}/generate-qr`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Items',
                    href: '/items',
                },
                {
                    title: item.property_number,
                    href: '#',
                },
            ]}
        >
            <Head title={`Item: ${item.property_number}`} />

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Link href="/items">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {item.brand} {item.model || item.name}
                        </h1>
                        <p className="text-muted-foreground font-mono">
                            {item.property_number}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/items/${item.id}/history`}>
                            <Button variant="outline">
                                <History className="mr-2 h-4 w-4" />
                                History
                            </Button>
                        </Link>
                        {!item.qr_code ? (
                            <Button onClick={handleGenerateQr} variant="outline">
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate QR
                            </Button>
                        ) : (
                            <Link href={`/items/${item.id}/print-qr`}>
                                <Button variant="outline">
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Print QR
                                </Button>
                            </Link>
                        )}
                        <Link href={`/items/${item.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* IAR & Property Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>IAR & Property Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">IAR Number</p>
                                <p className="font-mono">{item.iar_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Property Number</p>
                                <p className="font-mono font-semibold">{item.property_number}</p>
                            </div>
                            {item.fund_cluster && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Fund Cluster</p>
                                    <p className="font-mono">{item.fund_cluster}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status & Condition */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status & Condition</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={statusColors[item.status]} className="mt-1">
                                    {item.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Condition</p>
                                <Badge variant={conditionColors[item.condition]} className="mt-1">
                                    {item.condition.toUpperCase()}
                                </Badge>
                            </div>
                            {item.qr_code && (
                                <div>
                                    <p className="text-sm text-muted-foreground">QR Code</p>
                                    <p className="font-mono text-sm">{item.qr_code}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Item Description */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Item Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{item.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p>{item.description}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {item.brand && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Brand</p>
                                        <p>{item.brand}</p>
                                    </div>
                                )}
                                {item.model && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Model</p>
                                        <p>{item.model}</p>
                                    </div>
                                )}
                                {item.serial_number && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Serial Number</p>
                                        <p className="font-mono">{item.serial_number}</p>
                                    </div>
                                )}
                            </div>
                            {item.specifications && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Specifications</p>
                                    <p className="text-sm whitespace-pre-line">{item.specifications}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Acquisition Cost</p>
                                <p className="text-2xl font-bold font-mono">
                                    ₱{Number.parseFloat(item.acquisition_cost).toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Quantity</p>
                                    <p>{item.quantity}</p>
                                </div>
                                {item.unit_of_measure && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit</p>
                                        <p>{item.unit_of_measure}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Classification & Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Classification & Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p>{item.category.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p>{item.location.name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accountability */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Accountability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {item.accountable_person ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Accountable Person</p>
                                        <p className="font-medium">{item.accountable_person.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.accountable_person.email}</p>
                                    </div>
                                </div>
                            ) : (item.accountable_person_name || item.accountable_person_position) ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {item.accountable_person_name && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Accountable Person</p>
                                            <p className="font-medium">{item.accountable_person_name}</p>
                                        </div>
                                    )}
                                    {item.accountable_person_position && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Position</p>
                                            <p>{item.accountable_person_position}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No accountable person assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Important Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Date Acquired</p>
                                <p>{new Date(item.date_acquired).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}</p>
                            </div>
                            {item.date_inventoried && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Date Inventoried</p>
                                    <p>{new Date(item.date_inventoried).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</p>
                                </div>
                            )}
                            {item.estimated_useful_life && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated Useful Life</p>
                                    <p>{new Date(item.estimated_useful_life).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="text-sm">
                                    {new Date(item.created_at).toLocaleString()}
                                    {item.creator && <span className="text-muted-foreground"> by {item.creator.name}</span>}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-sm">
                                    {new Date(item.updated_at).toLocaleString()}
                                    {item.updater && <span className="text-muted-foreground"> by {item.updater.name}</span>}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Remarks */}
                    {item.remarks && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Remarks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">{item.remarks}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
