import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Category {
    id: number;
    name: string;
}

interface Location {
    id: number;
    name: string;
}

interface Item {
    id: number;
    name: string;
    property_number: string;
    brand?: string;
    model?: string;
    category?: Category;
    location?: Location;
}

interface Disposal {
    id: number;
    reason: string;
    description: string;
    status: string;
    estimated_value?: number;
    disposal_method?: string;
    recipient?: string;
    scheduled_for?: string;
    requested_at: string;
    item: Item;
    requested_by: User;
}

interface Props {
    disposals: Disposal[];
}

export default function Pending({ disposals }: Readonly<Props>) {
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const reasonLabels: Record<string, string> = {
        'obsolete': 'Obsolete',
        'damaged_beyond_repair': 'Damaged Beyond Repair',
        'expired': 'Expired',
        'lost': 'Lost',
        'stolen': 'Stolen',
        'donated': 'To be Donated',
        'sold': 'To be Sold',
        'other': 'Other',
    };

    const methodLabels: Record<string, string> = {
        'destroy': 'Destroy',
        'donate': 'Donate',
        'sell': 'Sell',
        'recycle': 'Recycle',
        'other': 'Other',
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleQuickReject = (id: number) => {
        router.post(`/disposals/${id}/reject`, {
            rejection_notes: 'Rejected from pending approvals view',
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setRejectingId(null),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Disposal', href: '/disposals' },
                { title: 'Pending Approvals', href: '#' },
            ]}
        >
            <Head title="Pending Disposal Approvals" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pending Disposal Approvals</h1>
                        <p className="text-muted-foreground">
                            Review and approve disposal requests from users
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/disposals">
                            <Button variant="outline">
                                View All Disposals
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Approvals
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{disposals.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Waiting for your review
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Estimated Value
                            </CardTitle>
                            <span className="text-lg">₱</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {disposals.reduce((sum, d) => sum + (d.estimated_value || 0), 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Combined value of pending items
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Oldest Request
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {disposals.length > 0 ? formatDate(disposals[0].requested_at) : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Needs attention
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Queue</CardTitle>
                        <CardDescription>
                            Review disposal requests and take action
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {disposals.length === 0 ? (
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>
                                    No pending disposal requests at the moment. All caught up! 🎉
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Requested By</TableHead>
                                        <TableHead>Requested Date</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {disposals.map((disposal) => (
                                        <TableRow key={disposal.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {disposal.item.brand} {disposal.item.model || disposal.item.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground font-mono">
                                                        {disposal.item.property_number}
                                                    </p>
                                                    {disposal.item.category && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {disposal.item.category.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {reasonLabels[disposal.reason] || disposal.reason}
                                                </Badge>
                                                {disposal.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xs">
                                                        {disposal.description}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{disposal.requested_by.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {disposal.requested_by.email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {formatDate(disposal.requested_at)}
                                            </TableCell>
                                            <TableCell>
                                                {disposal.estimated_value ? (
                                                    <span className="font-mono">
                                                        ₱{disposal.estimated_value.toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {disposal.disposal_method ? (
                                                    <Badge variant="secondary">
                                                        {methodLabels[disposal.disposal_method] || disposal.disposal_method}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">TBD</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/disposals/${disposal.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/disposals/${disposal.id}/approve-form`}>
                                                        <Button variant="default" size="sm">
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setRejectingId(disposal.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={rejectingId !== null} onOpenChange={() => setRejectingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Disposal Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reject the disposal request and restore the item to its previous status.
                            This action can be undone by creating a new disposal request.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => rejectingId && handleQuickReject(rejectingId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Reject Request
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
