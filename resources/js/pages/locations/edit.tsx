import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
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

interface Location {
  id: number;
  code: string;
  name: string;
  room_number: string | null;
  floor: string | null;
  building: string;
  description: string | null;
  is_active: boolean;
}

interface Props {
  location: Location;
}

export default function EditLocation({ location }: Readonly<Props>) {
  const { data, setData, put, processing, errors } = useForm({
    code: location.code,
    name: location.name,
    room_number: location.room_number || '',
    floor: location.floor || '',
    building: location.building,
    description: location.description || '',
    is_active: location.is_active,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/locations/${location.id}`);
  };

  return (
    <AppLayout
      breadcrumbs={[
        {
          title: 'Locations',
          href: '/locations',
        },
        {
          title: location.name,
          href: `/locations/${location.id}`,
        },
        {
          title: 'Edit',
          href: '#',
        },
      ]}
    >
      <Head title={`Edit ${location.name}`} />

      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Location</CardTitle>
              <CardDescription>
                Update the location information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      value={data.code}
                      onChange={(e) => setData('code', e.target.value)}
                      placeholder="e.g., LOC-001"
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    {errors.code && (
                      <p className="text-sm text-red-500">{errors.code}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Unique identifier for the location
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g., Storage Room A"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Display name for the location
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="room_number">Room Number</Label>
                    <Input
                      id="room_number"
                      type="text"
                      value={data.room_number}
                      onChange={(e) => setData('room_number', e.target.value)}
                      placeholder="e.g., 101"
                      className={errors.room_number ? 'border-red-500' : ''}
                    />
                    {errors.room_number && (
                      <p className="text-sm text-red-500">
                        {errors.room_number}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      type="text"
                      value={data.floor}
                      onChange={(e) => setData('floor', e.target.value)}
                      placeholder="e.g., 1st Floor"
                      className={errors.floor ? 'border-red-500' : ''}
                    />
                    {errors.floor && (
                      <p className="text-sm text-red-500">{errors.floor}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building">
                      Building <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="building"
                      type="text"
                      value={data.building}
                      onChange={(e) => setData('building', e.target.value)}
                      placeholder="e.g., Main Building"
                      className={errors.building ? 'border-red-500' : ''}
                    />
                    {errors.building && (
                      <p className="text-sm text-red-500">{errors.building}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe the location..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Optional detailed description of the location
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <Select
                    value={data.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) =>
                      setData('is_active', value === 'active')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.is_active && (
                    <p className="text-sm text-red-500">{errors.is_active}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Active locations can be assigned to items
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => globalThis.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Location'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
