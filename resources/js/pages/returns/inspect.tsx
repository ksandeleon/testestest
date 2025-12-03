import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Package,
    User,
    Calendar,
    AlertTriangle,
    Clock
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
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
    assigned_date: string;
    due_date: string | null;
    condition_on_assignment: string;
}

interface ItemReturn {
    id: number;
    assignment: Assignment;
    returned_by: User;
    return_date: string;
    condition_on_return: string;
    is_damaged: boolean;
    damage_description: string | null;
    is_late: boolean;
    days_late: number;
    notes: string | null;
}

interface Props {
    return: ItemReturn;
    conditions: string[];
}

export default function Inspect({ return: returnItem }: Readonly<Props>) {
    const { data, setData, post, processing, errors } = useForm({
        inspection_notes: '',
        is_damaged: returnItem.is_damaged || false,
        damage_description: returnItem.damage_description || '',
        item_condition: returnItem.condition_on_return,
        approve: true,
    });

    const handleSubmit = (approve: boolean) => {
        setData('approve', approve);
        post(`/returns/${returnItem.id}/process-inspection`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Assignment', href: '/assignments' },
                { title: 'Returns', href: '/returns' },
                { title: 'Pending Inspections', href: '/returns/pending-inspections' },
                { title: 'Inspect', href: '#' },
            ]}
        >
            <Head title="Inspect Return" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Inspect Return</h1>
                        <p className="text-muted-foreground">
                            Review and approve or reject the return
                        </p>
                    </div>
                    <Link href="/returns/pending-inspections">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Pending
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left column - Return Information */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Item Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Item Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Item</p>
                                    <p className="font-medium">
                                        {returnItem.assignment.item.brand} {returnItem.assignment.item.model || returnItem.assignment.item.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Property Number</p>
                                    <p className="font-mono font-medium">{returnItem.assignment.item.property_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Condition When Assigned</p>
                                    <Badge variant="secondary" className="capitalize">
                                        {returnItem.assignment.condition_on_assignment}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Condition on Return</p>
                                    <Badge
                                        variant={returnItem.is_damaged ? 'destructive' : 'secondary'}
                                        className="capitalize"
                                    >
                                        {returnItem.condition_on_return}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    User Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned To</p>
                                    <p className="font-medium">{returnItem.assignment.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{returnItem.assignment.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Returned By</p>
                                    <p className="font-medium">{returnItem.returned_by.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned Date</p>
                                    <p className="font-medium">
                                        {new Date(returnItem.assignment.assigned_date).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {returnItem.assignment.due_date && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Due Date</p>
                                        <p className="font-medium">
                                            {new Date(returnItem.assignment.due_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Return Date</p>
                                    <p className="font-medium">
                                        {new Date(returnItem.return_date).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Issues */}
                        {(returnItem.is_damaged || returnItem.is_late) && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-orange-900">
                                        <AlertTriangle className="h-5 w-5" />
                                        Issues Detected
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {returnItem.is_damaged && (
                                        <div>
                                            <Badge variant="destructive">Damaged</Badge>
                                            {returnItem.damage_description && (
                                                <p className="text-sm mt-2 text-orange-900">
                                                    {returnItem.damage_description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {returnItem.is_late && (
                                        <div>
                                            <Badge variant="outline" className="border-orange-600 text-orange-600">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {returnItem.days_late} day{returnItem.days_late > 1 ? 's' : ''} late
                                            </Badge>
                                            <p className="text-sm mt-2 text-orange-700">
                                                Late return may incur penalties
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column - Inspection Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inspection Form</CardTitle>
                                <CardDescription>
                                    Verify the item condition and document your findings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                    {returnItem.notes && (
                                        <div className="rounded-lg border bg-muted p-4">
                                            <p className="text-sm font-semibold mb-1">Return Notes</p>
                                            <p className="text-sm">{returnItem.notes}</p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="item_condition">Verified Item Condition *</Label>
                                        <Select
                                            value={data.item_condition}
                                            onValueChange={(value) => setData('item_condition', value)}
                                        >
                                            <SelectTrigger id="item_condition">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="excellent">Excellent</SelectItem>
                                                <SelectItem value="good">Good</SelectItem>
                                                <SelectItem value="fair">Fair</SelectItem>
                                                <SelectItem value="poor">Poor</SelectItem>
                                                <SelectItem value="damaged">Damaged</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.item_condition && (
                                            <p className="text-sm text-destructive">{errors.item_condition}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_damaged"
                                            checked={data.is_damaged}
                                            onChange={(e) => setData('is_damaged', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="is_damaged" className="cursor-pointer">
                                            Confirm item is damaged
                                        </Label>
                                    </div>

                                    {data.is_damaged && (
                                        <div className="space-y-2">
                                            <Label htmlFor="damage_description">Damage Description *</Label>
                                            <Textarea
                                                id="damage_description"
                                                placeholder="Describe the damage found during inspection..."
                                                value={data.damage_description}
                                                onChange={(e) => setData('damage_description', e.target.value)}
                                                rows={4}
                                            />
                                            {errors.damage_description && (
                                                <p className="text-sm text-destructive">{errors.damage_description}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="inspection_notes">Inspection Notes</Label>
                                        <Textarea
                                            id="inspection_notes"
                                            placeholder="Add any inspection findings, observations, or recommendations..."
                                            value={data.inspection_notes}
                                            onChange={(e) => setData('inspection_notes', e.target.value)}
                                            rows={6}
                                        />
                                        {errors.inspection_notes && (
                                            <p className="text-sm text-destructive">{errors.inspection_notes}</p>
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <p className="text-sm text-blue-900">
                                            <strong>Note:</strong> Approving this return will make the item available
                                            for new assignments (unless marked as damaged). Rejecting will keep the
                                            item with the current user.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-2 mt-6">
                                <Link href="/returns/pending-inspections">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleSubmit(false)}
                                    disabled={processing}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject Return
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit(true)}
                                    disabled={processing}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {processing ? 'Processing...' : 'Approve Return'}
                                </Button>
                            </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
