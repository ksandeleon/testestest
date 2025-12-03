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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PackageOpen, ArrowLeft } from 'lucide-react';

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
    assigned_date: string;
    due_date: string | null;
    condition_on_assignment: string;
}

interface Props {
    activeAssignments: Assignment[];
}

export default function Create({ activeAssignments }: Readonly<Props>) {
    const { data, setData, post, processing, errors } = useForm({
        assignment_id: '',
        return_date: new Date().toISOString().split('T')[0],
        condition_on_return: 'good',
        is_damaged: false,
        damage_description: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/returns');
    };

    const selectedAssignment = activeAssignments.find(
        (a) => a.id.toString() === data.assignment_id
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Assignment', href: '/assignments' },
                { title: 'Returns', href: '/returns' },
                { title: 'Process Return', href: '/returns/create' },
            ]}
        >
            <Head title="Process Return" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Process Item Return</h1>
                        <p className="text-muted-foreground">
                            Document the return of an assigned item
                        </p>
                    </div>
                    <Link href="/returns">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Returns
                        </Button>
                    </Link>
                </div>

                {activeAssignments.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="flex flex-col items-center gap-2">
                                <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
                                <p className="text-lg font-medium">No active assignments</p>
                                <p className="text-sm text-muted-foreground">
                                    There are no items currently assigned that can be returned
                                </p>
                                <Link href="/assignments" className="mt-4">
                                    <Button>View Assignments</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Return Details</CardTitle>
                                    <CardDescription>
                                        Select the assignment and document the return
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="assignment_id">Assignment to Return *</Label>
                                        <Select
                                            value={data.assignment_id}
                                            onValueChange={(value) => setData('assignment_id', value)}
                                        >
                                            <SelectTrigger id="assignment_id">
                                                <SelectValue placeholder="Select an active assignment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeAssignments.map((assignment) => (
                                                    <SelectItem
                                                        key={assignment.id}
                                                        value={assignment.id.toString()}
                                                    >
                                                        {assignment.item.brand} {assignment.item.model || assignment.item.name}
                                                        ({assignment.item.property_number}) - {assignment.user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.assignment_id && (
                                            <p className="text-sm text-destructive">{errors.assignment_id}</p>
                                        )}
                                    </div>

                                    {selectedAssignment && (
                                        <div className="rounded-lg border bg-muted p-4 space-y-2">
                                            <h4 className="font-semibold">Assignment Information</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Assigned to:</span>
                                                    <p className="font-medium">{selectedAssignment.user.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Assigned date:</span>
                                                    <p className="font-medium">
                                                        {new Date(selectedAssignment.assigned_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {selectedAssignment.due_date && (
                                                    <div>
                                                        <span className="text-muted-foreground">Due date:</span>
                                                        <p className="font-medium">
                                                            {new Date(selectedAssignment.due_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-muted-foreground">Condition when assigned:</span>
                                                    <p className="font-medium capitalize">
                                                        {selectedAssignment.condition_on_assignment}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="return_date">Return Date *</Label>
                                        <Input
                                            id="return_date"
                                            type="date"
                                            value={data.return_date}
                                            onChange={(e) => setData('return_date', e.target.value)}
                                        />
                                        {errors.return_date && (
                                            <p className="text-sm text-destructive">{errors.return_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="condition_on_return">Condition on Return *</Label>
                                        <Select
                                            value={data.condition_on_return}
                                            onValueChange={(value) => setData('condition_on_return', value)}
                                        >
                                            <SelectTrigger id="condition_on_return">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="excellent">Excellent</SelectItem>
                                                <SelectItem value="good">Good</SelectItem>
                                                <SelectItem value="fair">Fair</SelectItem>
                                                <SelectItem value="poor">Poor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.condition_on_return && (
                                            <p className="text-sm text-destructive">{errors.condition_on_return}</p>
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
                                            Item has visible damage
                                        </Label>
                                    </div>

                                    {data.is_damaged && (
                                        <div className="space-y-2">
                                            <Label htmlFor="damage_description">Damage Description *</Label>
                                            <Textarea
                                                id="damage_description"
                                                placeholder="Describe the damage in detail..."
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
                                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Any additional information about the return..."
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={4}
                                        />
                                        {errors.notes && (
                                            <p className="text-sm text-destructive">{errors.notes}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-2">
                                <Link href="/returns">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <PackageOpen className="mr-2 h-4 w-4" />
                                    {processing ? 'Processing...' : 'Process Return'}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
