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
import { Input } from '@/components/ui/input';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    status: string;
    condition: string;
    category?: Category;
    location?: Location;
}

interface Props {
    items: Item[];
    reasons: string[];
    methods: string[];
}

export default function Create({ items, reasons, methods }: Readonly<Props>) {
    const { data, setData, post, processing, errors } = useForm({
        item_id: '',
        reason: '',
        description: '',
        estimated_value: '',
        disposal_method: '',
        recipient: '',
        scheduled_for: '',
    });

    const selectedItem = items.find(item => item.id === Number(data.item_id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/disposals');
    };

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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Disposal', href: '/disposals' },
                { title: 'Request Disposal', href: '#' },
            ]}
        >
            <Head title="Request Disposal" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Request Item Disposal</h1>
                        <p className="text-muted-foreground">
                            Submit a request to dispose of an item from inventory
                        </p>
                    </div>
                    <Link href="/disposals">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Button>
                    </Link>
                </div>

                {items.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No items available for disposal. Only available or damaged items can be disposed.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Disposal Information</CardTitle>
                                        <CardDescription>
                                            Provide details about why this item should be disposed
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Item Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="item_id">Select Item *</Label>
                                            <Select
                                                value={data.item_id}
                                                onValueChange={(value) => setData('item_id', value)}
                                            >
                                                <SelectTrigger id="item_id">
                                                    <SelectValue placeholder="Choose an item to dispose" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {items.map((item) => (
                                                        <SelectItem key={item.id} value={item.id.toString()}>
                                                            {item.brand} {item.model || item.name} - {item.property_number}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.item_id && (
                                                <p className="text-sm text-destructive">{errors.item_id}</p>
                                            )}
                                        </div>

                                        {/* Reason */}
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Disposal Reason *</Label>
                                            <Select
                                                value={data.reason}
                                                onValueChange={(value) => setData('reason', value)}
                                            >
                                                <SelectTrigger id="reason">
                                                    <SelectValue placeholder="Select disposal reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {reasons.map((reason) => (
                                                        <SelectItem key={reason} value={reason}>
                                                            {reasonLabels[reason] || reason}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.reason && (
                                                <p className="text-sm text-destructive">{errors.reason}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Detailed Description *</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Explain in detail why this item needs to be disposed..."
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                rows={5}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Minimum 10 characters. Be specific about the condition and reason.
                                            </p>
                                            {errors.description && (
                                                <p className="text-sm text-destructive">{errors.description}</p>
                                            )}
                                        </div>

                                        {/* Estimated Value */}
                                        <div className="space-y-2">
                                            <Label htmlFor="estimated_value">Estimated Value (Optional)</Label>
                                            <Input
                                                id="estimated_value"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={data.estimated_value}
                                                onChange={(e) => setData('estimated_value', e.target.value)}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Current estimated value of the item
                                            </p>
                                            {errors.estimated_value && (
                                                <p className="text-sm text-destructive">{errors.estimated_value}</p>
                                            )}
                                        </div>

                                        {/* Disposal Method */}
                                        <div className="space-y-2">
                                            <Label htmlFor="disposal_method">Proposed Disposal Method (Optional)</Label>
                                            <Select
                                                value={data.disposal_method}
                                                onValueChange={(value) => setData('disposal_method', value)}
                                            >
                                                <SelectTrigger id="disposal_method">
                                                    <SelectValue placeholder="Select disposal method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {methods.map((method) => (
                                                        <SelectItem key={method} value={method}>
                                                            {methodLabels[method] || method}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-sm text-muted-foreground">
                                                Suggest how this item should be disposed (can be changed during approval)
                                            </p>
                                            {errors.disposal_method && (
                                                <p className="text-sm text-destructive">{errors.disposal_method}</p>
                                            )}
                                        </div>

                                        {/* Recipient (for donate/sell) */}
                                        {(data.disposal_method === 'donate' || data.disposal_method === 'sell') && (
                                            <div className="space-y-2">
                                                <Label htmlFor="recipient">Recipient/Buyer (Optional)</Label>
                                                <Input
                                                    id="recipient"
                                                    placeholder="Name of recipient or buyer"
                                                    value={data.recipient}
                                                    onChange={(e) => setData('recipient', e.target.value)}
                                                />
                                                {errors.recipient && (
                                                    <p className="text-sm text-destructive">{errors.recipient}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Scheduled Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="scheduled_for">Proposed Disposal Date (Optional)</Label>
                                            <Input
                                                id="scheduled_for"
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={data.scheduled_for}
                                                onChange={(e) => setData('scheduled_for', e.target.value)}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                When you propose the disposal should be executed
                                            </p>
                                            {errors.scheduled_for && (
                                                <p className="text-sm text-destructive">{errors.scheduled_for}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar - Item Preview */}
                            <div className="space-y-6">
                                {selectedItem && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Selected Item</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Item Name</p>
                                                <p className="font-medium">
                                                    {selectedItem.brand} {selectedItem.model || selectedItem.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Property Number</p>
                                                <p className="font-mono font-medium">{selectedItem.property_number}</p>
                                            </div>
                                            {selectedItem.category && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Category</p>
                                                    <p>{selectedItem.category.name}</p>
                                                </div>
                                            )}
                                            {selectedItem.location && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Location</p>
                                                    <p>{selectedItem.location.name}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-muted-foreground">Current Status</p>
                                                <p className="capitalize">{selectedItem.status}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Condition</p>
                                                <p className="capitalize">{selectedItem.condition}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="bg-blue-50 border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="text-blue-900">Important Note</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-blue-900 space-y-2">
                                        <p>
                                            • This request will be reviewed by an administrator
                                        </p>
                                        <p>
                                            • The item status will be set to "Pending Disposal"
                                        </p>
                                        <p>
                                            • Approval is required before disposal can be executed
                                        </p>
                                        <p>
                                            • Provide detailed information to expedite approval
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-2 mt-6">
                            <Link href="/disposals">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
