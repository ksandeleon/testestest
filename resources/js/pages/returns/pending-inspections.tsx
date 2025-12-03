import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Clock,
    Calendar,
    User,
    Package,
    AlertTriangle,
    ClipboardCheck
} from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface Item {
    id: number;
    name: string;
    property_number: string;
    brand?: string;
    model?: string;
}

interface Assignment {
    id: number;
    item: Item;
    user: User;
}

interface ItemReturn {
    id: number;
    assignment: Assignment;
    returned_by: User;
    status: string;
    return_date: string;
    condition_on_return: string;
    is_damaged: boolean;
    is_late: boolean;
    days_late: number;
}

interface Props {
    returns: ItemReturn[];
}

export default function PendingInspections({ returns }: Readonly<Props>) {
    const handleInspect = (id: number) => {
        router.get(`/returns/${id}/inspect`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '/items' },
                { title: 'Returns', href: '/returns' },
                { title: 'Pending Inspections', href: '/returns/pending-inspections' },
            ]}
        >
            <Head title="Pending Inspections" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pending Inspections</h1>
                        <p className="text-muted-foreground">
                            Review and inspect returned items
                        </p>
                    </div>
                    <Link href="/returns">
                        <Button variant="outline">
                            View All Returns
                        </Button>
                    </Link>
                </div>

                {/* Stats Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Awaiting Inspection</CardDescription>
                        <CardTitle className="text-4xl">{returns.length}</CardTitle>
                    </CardHeader>
                </Card>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableCaption>
                            {returns.length === 0
                                ? 'No returns pending inspection'
                                : 'Returns awaiting your inspection'}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Returned By</TableHead>
                                <TableHead>Return Date</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Issues</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {returns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-lg font-medium">All caught up!</p>
                                            <p className="text-sm text-muted-foreground">
                                                No returns are waiting for inspection
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                returns.map((returnItem) => (
                                    <TableRow key={returnItem.id} className="group">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    {returnItem.assignment.item.brand} {returnItem.assignment.item.model || returnItem.assignment.item.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground font-mono">
                                                    {returnItem.assignment.item.property_number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{returnItem.returned_by.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Assigned to: {returnItem.assignment.user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(returnItem.return_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={returnItem.is_damaged ? 'destructive' : 'secondary'}
                                            >
                                                {returnItem.condition_on_return}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {returnItem.is_damaged && (
                                                    <Badge variant="destructive" className="w-fit">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Damaged
                                                    </Badge>
                                                )}
                                                {returnItem.is_late && (
                                                    <Badge variant="outline" className="text-orange-600 border-orange-600 w-fit">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {returnItem.days_late} day{returnItem.days_late > 1 ? 's' : ''} late
                                                    </Badge>
                                                )}
                                                {!returnItem.is_damaged && !returnItem.is_late && (
                                                    <Badge variant="secondary" className="w-fit">
                                                        No Issues
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleInspect(returnItem.id)}
                                            >
                                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                                Inspect
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Info Banner */}
                {returns.length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <ClipboardCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900">Inspection Required</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Click "Inspect" to review each return, verify the item condition,
                                    and approve or reject the return. Late returns may incur penalties.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
