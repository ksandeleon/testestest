import AppLayout from '@/layouts/app-layout';
import { index as maintenanceIndex, store as maintenanceStore } from '@/routes/maintenance';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Item {
    id: number;
    name: string;
    property_number: string;
    brand: string;
    model: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    items: Item[];
    technicians: User[];
}

export default function Create({ items, technicians }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        item_id: '',
        maintenance_type: 'corrective',
        priority: 'medium',
        title: '',
        description: '',
        issue_reported: '',
        estimated_cost: '',
        scheduled_date: '',
        estimated_duration: '',
        assigned_to: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(maintenanceStore().url);
    };

    return (
        <AppLayout>
            <Head title="Create Maintenance Request" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Maintenance Request</h1>
                        <p className="text-muted-foreground">Submit a new maintenance request for an item</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={maintenanceIndex()}>Cancel</Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance Details</CardTitle>
                            <CardDescription>Fill in the information about the maintenance request</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Item Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="item_id">Item *</Label>
                                <Select value={data.item_id} onValueChange={(value) => setData('item_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.property_number} - {item.name} ({item.brand} {item.model})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.item_id && <p className="text-sm text-destructive">{errors.item_id}</p>}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Brief description of the issue"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            {/* Type & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maintenance_type">Maintenance Type *</Label>
                                    <Select value={data.maintenance_type} onValueChange={(value) => setData('maintenance_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="preventive">Preventive</SelectItem>
                                            <SelectItem value="corrective">Corrective</SelectItem>
                                            <SelectItem value="predictive">Predictive</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.maintenance_type && <p className="text-sm text-destructive">{errors.maintenance_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Detailed description of the maintenance request"
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            {/* Issue Reported */}
                            <div className="space-y-2">
                                <Label htmlFor="issue_reported">Issue Reported</Label>
                                <Textarea
                                    id="issue_reported"
                                    value={data.issue_reported}
                                    onChange={(e) => setData('issue_reported', e.target.value)}
                                    placeholder="What is the problem or issue?"
                                    rows={2}
                                />
                                {errors.issue_reported && <p className="text-sm text-destructive">{errors.issue_reported}</p>}
                            </div>

                            {/* Scheduling */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_date">Scheduled Date</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="datetime-local"
                                        value={data.scheduled_date}
                                        onChange={(e) => setData('scheduled_date', e.target.value)}
                                    />
                                    {errors.scheduled_date && <p className="text-sm text-destructive">{errors.scheduled_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                                    <Input
                                        id="estimated_duration"
                                        type="number"
                                        value={data.estimated_duration}
                                        onChange={(e) => setData('estimated_duration', e.target.value)}
                                        placeholder="120"
                                    />
                                    {errors.estimated_duration && <p className="text-sm text-destructive">{errors.estimated_duration}</p>}
                                </div>
                            </div>

                            {/* Cost & Assignment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="estimated_cost">Estimated Cost (₱)</Label>
                                    <Input
                                        id="estimated_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.estimated_cost}
                                        onChange={(e) => setData('estimated_cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.estimated_cost && <p className="text-sm text-destructive">{errors.estimated_cost}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_to">Assign To</Label>
                                    <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a technician" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {technicians.map((tech) => (
                                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                                    {tech.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.assigned_to && <p className="text-sm text-destructive">{errors.assigned_to}</p>}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional information..."
                                    rows={2}
                                />
                                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Maintenance Request'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={maintenanceIndex()}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}

Create.layout = (page: React.ReactNode) => page;
