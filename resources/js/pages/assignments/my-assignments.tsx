import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
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
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Package,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText
} from 'lucide-react';

interface Item {
    id: number;
    name: string;
    property_number: string;
    brand?: string;
    model?: string;
    category?: { name: string };
    location?: { name: string };
}

interface User {
    id: number;
    name: string;
}

interface Assignment {
    id: number;
    item: Item;
    assigned_by: User;
    status: string;
    assigned_date: string;
    due_date: string | null;
    purpose: string | null;
    condition_on_assignment: string;
}

interface Stats {
    total: number;
    active: number;
    overdue: number;
}

interface Props {
    assignments: Assignment[];
    stats: Stats;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
    pending: { label: 'Pending Approval', variant: 'outline', icon: Clock },
    approved: { label: 'Approved', variant: 'secondary', icon: CheckCircle },
    active: { label: 'In Use', variant: 'default', icon: CheckCircle },
    returned: { label: 'Returned', variant: 'secondary', icon: CheckCircle },
};

const conditionConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    excellent: { label: 'Excellent', variant: 'default' },
    good: { label: 'Good', variant: 'secondary' },
    fair: { label: 'Fair', variant: 'outline' },
    poor: { label: 'Poor', variant: 'destructive' },
};

export default function MyAssignments({ assignments, stats }: Readonly<Props>) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '/items' },
                { title: 'My Assignments', href: '/assignments/my-assignments' },
            ]}
        >
            <Head title="My Assignments" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Assignments</h1>
                        <p className="text-muted-foreground">
                            Items currently assigned to you
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Assignments</CardDescription>
                            <CardTitle className="text-3xl">{stats.total}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                All items assigned to you
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Currently in your possession
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Overdue</CardDescription>
                            <CardTitle className="text-3xl text-red-600">{stats.overdue}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {stats.overdue > 0 ? 'Please return these items' : 'All on time'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableCaption>A list of items assigned to you</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Assigned By</TableHead>
                                <TableHead>Assigned Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Purpose</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-lg font-medium">No assignments yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                You don't have any items assigned to you
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((assignment) => {
                                    const statusInfo = statusConfig[assignment.status];
                                    const conditionInfo = conditionConfig[assignment.condition_on_assignment];
                                    const StatusIcon = statusInfo.icon;
                                    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date() && assignment.status === 'active';

                                    return (
                                        <TableRow key={assignment.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        {assignment.item.brand} {assignment.item.model || assignment.item.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {assignment.item.property_number}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {assignment.item.category?.name || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {assignment.item.location?.name || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{assignment.assigned_by.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(assignment.assigned_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {assignment.due_date ? (
                                                    <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(assignment.due_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                        {isOverdue && (
                                                            <Badge variant="destructive" className="ml-1">
                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No due date</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={conditionInfo.variant}>
                                                    {conditionInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm max-w-xs flex items-start gap-1">
                                                    {assignment.purpose ? (
                                                        <>
                                                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                            <span className="line-clamp-2">{assignment.purpose}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {stats.overdue > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Overdue Items</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    You have {stats.overdue} overdue item{stats.overdue > 1 ? 's' : ''}.
                                    Please return {stats.overdue > 1 ? 'them' : 'it'} as soon as possible to avoid penalties.
                                </p>
                                <Link href="/returns/create">
                                    <Button size="sm" variant="outline" className="mt-2 border-red-600 text-red-600 hover:bg-red-100">
                                        Return Items
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
