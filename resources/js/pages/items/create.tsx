import AppLayout from '@/layouts/app-layout';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    code: string;
}

interface Location {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    categories: Category[];
    locations: Location[];
    users: User[];
}

export default function Create({ categories, locations, users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        iar_number: '',
        property_number: '',
        fund_cluster: '',
        name: '',
        description: '',
        brand: '',
        model: '',
        serial_number: '',
        specifications: '',
        acquisition_cost: '',
        unit_of_measure: 'pcs',
        quantity: '1',
        category_id: '',
        location_id: '',
        accountable_person_id: '',
        accountable_person_name: '',
        accountable_person_position: '',
        date_acquired: '',
        date_inventoried: '',
        estimated_useful_life: '',
        status: 'available',
        condition: 'good',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/items');
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Items',
                    href: '/items',
                },
                {
                    title: 'Create',
                    href: '#',
                },
            ]}
        >
            <Head title="Add New Item" />

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Link href="/items">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add New Item
                        </h1>
                        <p className="text-muted-foreground">
                            Register a new property item in the inventory
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* IAR & Property Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>IAR & Property Information</CardTitle>
                            <CardDescription>
                                Inventory and Acknowledgement Receipt details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="iar_number">IAR Number *</Label>
                                    <Input
                                        id="iar_number"
                                        value={data.iar_number}
                                        onChange={(e) => setData('iar_number', e.target.value)}
                                        placeholder="IAR-2024-001"
                                        required
                                    />
                                    {errors.iar_number && (
                                        <p className="text-sm text-destructive">{errors.iar_number}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="property_number">Property Number *</Label>
                                    <Input
                                        id="property_number"
                                        value={data.property_number}
                                        onChange={(e) => setData('property_number', e.target.value)}
                                        placeholder="2024-01-001-001"
                                        required
                                    />
                                    {errors.property_number && (
                                        <p className="text-sm text-destructive">{errors.property_number}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fund_cluster">Fund Cluster</Label>
                                    <Input
                                        id="fund_cluster"
                                        value={data.fund_cluster}
                                        onChange={(e) => setData('fund_cluster', e.target.value)}
                                        placeholder="FUND 164"
                                    />
                                    {errors.fund_cluster && (
                                        <p className="text-sm text-destructive">{errors.fund_cluster}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Item Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Item Description</CardTitle>
                            <CardDescription>
                                Detailed information about the item
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Desktop Computer"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Full desktop computer with specifications..."
                                    required
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        placeholder="Acer"
                                    />
                                    {errors.brand && (
                                        <p className="text-sm text-destructive">{errors.brand}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Input
                                        id="model"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                        placeholder="Veriton M4665G"
                                    />
                                    {errors.model && (
                                        <p className="text-sm text-destructive">{errors.model}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serial_number">Serial Number</Label>
                                    <Input
                                        id="serial_number"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                        placeholder="SN123456789"
                                    />
                                    {errors.serial_number && (
                                        <p className="text-sm text-destructive">{errors.serial_number}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specifications">Specifications</Label>
                                <Textarea
                                    id="specifications"
                                    value={data.specifications}
                                    onChange={(e) => setData('specifications', e.target.value)}
                                    placeholder="Intel Core i5, 8GB RAM, 256GB SSD..."
                                />
                                {errors.specifications && (
                                    <p className="text-sm text-destructive">{errors.specifications}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Information</CardTitle>
                            <CardDescription>
                                Cost and quantity details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="acquisition_cost">Acquisition Cost (₱) *</Label>
                                    <Input
                                        id="acquisition_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.acquisition_cost}
                                        onChange={(e) => setData('acquisition_cost', e.target.value)}
                                        placeholder="78710.00"
                                        required
                                    />
                                    {errors.acquisition_cost && (
                                        <p className="text-sm text-destructive">{errors.acquisition_cost}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                                    <Input
                                        id="unit_of_measure"
                                        value={data.unit_of_measure}
                                        onChange={(e) => setData('unit_of_measure', e.target.value)}
                                        placeholder="pcs, set, unit"
                                    />
                                    {errors.unit_of_measure && (
                                        <p className="text-sm text-destructive">{errors.unit_of_measure}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        required
                                    />
                                    {errors.quantity && (
                                        <p className="text-sm text-destructive">{errors.quantity}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Classification & Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Classification & Location</CardTitle>
                            <CardDescription>
                                Category and storage location
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category *</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => setData('category_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-sm text-destructive">{errors.category_id}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location_id">Location *</Label>
                                    <Select
                                        value={data.location_id}
                                        onValueChange={(value) => setData('location_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {location.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.location_id && (
                                        <p className="text-sm text-destructive">{errors.location_id}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accountability */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Accountability</CardTitle>
                            <CardDescription>
                                Person responsible for this item
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="accountable_person_id">Accountable Person</Label>
                                <Select
                                    value={data.accountable_person_id || 'none'}
                                    onValueChange={(value) => setData('accountable_person_id', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select person (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.accountable_person_id && (
                                    <p className="text-sm text-destructive">{errors.accountable_person_id}</p>
                                )}
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="accountable_person_name">Or Enter Name</Label>
                                    <Input
                                        id="accountable_person_name"
                                        value={data.accountable_person_name}
                                        onChange={(e) => setData('accountable_person_name', e.target.value)}
                                        placeholder="DR. JESUS PAGUIGAN"
                                    />
                                    {errors.accountable_person_name && (
                                        <p className="text-sm text-destructive">{errors.accountable_person_name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountable_person_position">Position</Label>
                                    <Input
                                        id="accountable_person_position"
                                        value={data.accountable_person_position}
                                        onChange={(e) => setData('accountable_person_position', e.target.value)}
                                        placeholder="Director, MIS Office"
                                    />
                                    {errors.accountable_person_position && (
                                        <p className="text-sm text-destructive">{errors.accountable_person_position}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates & Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dates & Status</CardTitle>
                            <CardDescription>
                                Important dates and current status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="date_acquired">Date Acquired *</Label>
                                    <Input
                                        id="date_acquired"
                                        type="date"
                                        value={data.date_acquired}
                                        onChange={(e) => setData('date_acquired', e.target.value)}
                                        required
                                    />
                                    {errors.date_acquired && (
                                        <p className="text-sm text-destructive">{errors.date_acquired}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_inventoried">Date Inventoried</Label>
                                    <Input
                                        id="date_inventoried"
                                        type="date"
                                        value={data.date_inventoried}
                                        onChange={(e) => setData('date_inventoried', e.target.value)}
                                    />
                                    {errors.date_inventoried && (
                                        <p className="text-sm text-destructive">{errors.date_inventoried}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estimated_useful_life">Estimated Useful Life</Label>
                                    <Input
                                        id="estimated_useful_life"
                                        type="date"
                                        value={data.estimated_useful_life}
                                        onChange={(e) => setData('estimated_useful_life', e.target.value)}
                                    />
                                    {errors.estimated_useful_life && (
                                        <p className="text-sm text-destructive">{errors.estimated_useful_life}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="assigned">Assigned</SelectItem>
                                            <SelectItem value="in_use">In Use</SelectItem>
                                            <SelectItem value="in_maintenance">In Maintenance</SelectItem>
                                            <SelectItem value="for_disposal">For Disposal</SelectItem>
                                            <SelectItem value="disposed">Disposed</SelectItem>
                                            <SelectItem value="lost">Lost</SelectItem>
                                            <SelectItem value="damaged">Damaged</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-destructive">{errors.status}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="condition">Condition *</Label>
                                    <Select
                                        value={data.condition}
                                        onValueChange={(value) => setData('condition', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="excellent">Excellent</SelectItem>
                                            <SelectItem value="good">Good</SelectItem>
                                            <SelectItem value="fair">Fair</SelectItem>
                                            <SelectItem value="poor">Poor</SelectItem>
                                            <SelectItem value="for_repair">For Repair</SelectItem>
                                            <SelectItem value="unserviceable">Unserviceable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.condition && (
                                        <p className="text-sm text-destructive">{errors.condition}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Additional notes or comments..."
                                />
                                {errors.remarks && (
                                    <p className="text-sm text-destructive">{errors.remarks}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href="/items">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Item'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
