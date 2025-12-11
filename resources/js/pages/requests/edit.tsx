import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Request, RequestType, RequestPriority } from '@/types/request';
import { getRequestTypeLabel } from '@/components/requests/request-type-icon';
import { ArrowLeft } from 'lucide-react';

interface EditRequestProps {
  request: Request;
  available_items: Array<{
    id: number;
    name: string;
    tag_number: string;
    category?: { name: string };
  }>;
}

export default function EditRequest({ request, available_items }: Readonly<EditRequestProps>) {
  const [selectedType, setSelectedType] = useState<RequestType>(request.type);

  const { data, setData, put, processing, errors } = useForm({
    type: request.type,
    item_id: request.item_id,
    title: request.title,
    description: request.description,
    priority: request.priority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/requests/${request.id}`);
  };

  const requiresItem = ['assignment', 'maintenance', 'disposal'].includes(selectedType);

  return (
    <AppLayout>
      <Head title="Edit Request" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/requests/${request.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Request</h1>
              <p className="text-muted-foreground">
                Update your request details
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
            <CardDescription>Modify the details of your request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Request Type *</Label>
                <Select
                  value={data.type}
                  onValueChange={(value: RequestType) => {
                    setData('type', value);
                    setSelectedType(value);
                    if (!requiresItem) {
                      setData('item_id', undefined);
                    }
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">{getRequestTypeLabel('assignment')}</SelectItem>
                    <SelectItem value="purchase">{getRequestTypeLabel('purchase')}</SelectItem>
                    <SelectItem value="disposal">{getRequestTypeLabel('disposal')}</SelectItem>
                    <SelectItem value="maintenance">{getRequestTypeLabel('maintenance')}</SelectItem>
                    <SelectItem value="transfer">{getRequestTypeLabel('transfer')}</SelectItem>
                    <SelectItem value="other">{getRequestTypeLabel('other')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>

              {/* Item Selection (conditional) */}
              {requiresItem && (
                <div className="space-y-2">
                  <Label htmlFor="item_id">Item *</Label>
                  <Select
                    value={data.item_id?.toString()}
                    onValueChange={(value) => setData('item_id', Number.parseInt(value, 10))}
                  >
                    <SelectTrigger id="item_id">
                      <SelectValue placeholder="Select an item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {available_items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.tag_number} - {item.name}
                          {item.category && ` (${item.category.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.item_id && <p className="text-sm text-destructive">{errors.item_id}</p>}
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Request Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Brief summary of your request"
                  maxLength={255}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Provide detailed information about your request and justification..."
                  rows={6}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">
                  {data.description.length} / 5000 characters
                </p>
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={data.priority}
                  onValueChange={(value: RequestPriority) => setData('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                >
                  <Link href={`/requests/${request.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
