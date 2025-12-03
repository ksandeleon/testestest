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
import { UserPlus, ArrowLeft } from 'lucide-react';

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
    category?: { name: string };
    location?: { name: string };
}

interface Props {
    users: User[];
    items: Item[];
}

export default function Create({ users, items }: Readonly<Props>) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        item_id: '',
        assigned_date: new Date().toISOString().split('T')[0],
        due_date: '',
        purpose: '',
        notes: '',
        condition_on_assignment: 'good',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/assignments');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Item Management', href: '/items' },
                { title: 'Assignments', href: '/assignments' },
                { title: 'Create', href: '/assignments/create' },
            ]}
        >
            <Head title="Create Assignment" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Assignment</h1>
                        <p className="text-muted-foreground">
                            Assign an item to a user
                        </p>
                    </div>
                    <Link href="/assignments">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Assignments
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
                                <CardDescription>
                                    Select the user and item for this assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="user_id">Assign To *</Label>
                                        <Select
                                            value={data.user_id}
                                            onValueChange={(value) => setData('user_id', value)}
                                        >
                                            <SelectTrigger id="user_id">
                                                <SelectValue placeholder="Select a user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.user_id && (
                                            <p className="text-sm text-destructive">{errors.user_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="item_id">Item *</Label>
                                        <Select
                                            value={data.item_id}
                                            onValueChange={(value) => setData('item_id', value)}
                                        >
                                            <SelectTrigger id="item_id">
                                                <SelectValue placeholder="Select an item" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {items.map((item) => (
                                                    <SelectItem key={item.id} value={item.id.toString()}>
                                                        {item.brand} {item.model || item.name} ({item.property_number})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.item_id && (
                                            <p className="text-sm text-destructive">{errors.item_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="assigned_date">Assigned Date *</Label>
                                        <Input
                                            id="assigned_date"
                                            type="date"
                                            value={data.assigned_date}
                                            onChange={(e) => setData('assigned_date', e.target.value)}
                                        />
                                        {errors.assigned_date && (
                                            <p className="text-sm text-destructive">{errors.assigned_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="due_date">Due Date (Optional)</Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                        />
                                        {errors.due_date && (
                                            <p className="text-sm text-destructive">{errors.due_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="condition_on_assignment">Condition on Assignment *</Label>
                                    <Select
                                        value={data.condition_on_assignment}
                                        onValueChange={(value) => setData('condition_on_assignment', value)}
                                    >
                                        <SelectTrigger id="condition_on_assignment">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="excellent">Excellent</SelectItem>
                                            <SelectItem value="good">Good</SelectItem>
                                            <SelectItem value="fair">Fair</SelectItem>
                                            <SelectItem value="poor">Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.condition_on_assignment && (
                                        <p className="text-sm text-destructive">{errors.condition_on_assignment}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purpose">Purpose (Optional)</Label>
                                    <Input
                                        id="purpose"
                                        placeholder="e.g., For teaching purposes"
                                        value={data.purpose}
                                        onChange={(e) => setData('purpose', e.target.value)}
                                    />
                                    {errors.purpose && (
                                        <p className="text-sm text-destructive">{errors.purpose}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any additional information about this assignment..."
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
                            <Link href="/assignments">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Assignment'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
