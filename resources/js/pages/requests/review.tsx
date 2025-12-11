import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestPriorityBadge } from '@/components/requests/request-priority-badge';
import { RequestTypeIcon, getRequestTypeLabel } from '@/components/requests/request-type-icon';
import type { Request } from '@/types/request';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ReviewRequestProps {
  request: Request;
}

export default function ReviewRequest({ request }: Readonly<ReviewRequestProps>) {
  const { data, setData, post, processing, errors } = useForm({
    action: 'approve' as 'approve' | 'reject' | 'request_changes',
    review_notes: '',
    auto_execute: false,
    due_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/requests/${request.id}/review`);
  };

  return (
    <AppLayout>
      <Head title={`Review Request: ${request.title}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/requests/pending-approvals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Review Request</h1>
            <p className="text-muted-foreground">Request #{request.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Details (Left) */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium text-lg mt-1">{request.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <RequestTypeIcon type={request.type} className="h-5 w-5" />
                    <span className="font-medium">{getRequestTypeLabel(request.type)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <RequestStatusBadge status={request.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div className="mt-1">
                    <RequestPriorityBadge priority={request.priority} showIcon />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="text-sm mt-1">
                    {new Date(request.requested_at || request.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Requester</Label>
                <div className="mt-1">
                  <p className="font-medium">{request.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 whitespace-pre-wrap text-sm">{request.description}</p>
              </div>

              {request.item && (
                <div>
                  <Label className="text-muted-foreground">Related Item</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="font-medium">{request.item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tag: {request.item.tag_number} • Status: {request.item.status}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form (Right) */}
          <Card>
            <CardHeader>
              <CardTitle>Review Decision</CardTitle>
              <CardDescription>Approve, reject, or request changes to this request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Action Selection */}
                <div className="space-y-3">
                  <Label>Decision *</Label>
                  <RadioGroup
                    value={data.action}
                    onValueChange={(value: 'approve' | 'reject' | 'request_changes') => setData('action', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="approve" id="approve" />
                      <Label htmlFor="approve" className="font-normal cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Approve Request</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reject" id="reject" />
                      <Label htmlFor="reject" className="font-normal cursor-pointer">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Reject Request</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="request_changes" id="request_changes" />
                      <Label htmlFor="request_changes" className="font-normal cursor-pointer">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span>Request Changes</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.action && <p className="text-sm text-destructive">{errors.action}</p>}
                </div>

                {/* Review Notes */}
                <div className="space-y-2">
                  <Label htmlFor="review_notes">
                    Review Notes *
                    {data.action === 'approve' && ' (Optional)'}
                  </Label>
                  <Textarea
                    id="review_notes"
                    value={data.review_notes}
                    onChange={(e) => setData('review_notes', e.target.value)}
                    placeholder={
                      data.action === 'approve'
                        ? 'Add any comments or instructions...'
                        : data.action === 'reject'
                        ? 'Please provide a reason for rejection...'
                        : 'Specify what changes are needed...'
                    }
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.review_notes.length} / 1000 characters
                  </p>
                  {errors.review_notes && <p className="text-sm text-destructive">{errors.review_notes}</p>}
                </div>

                {/* Auto Execute (Approve only) */}
                {data.action === 'approve' && request.type === 'assignment' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto_execute"
                        checked={data.auto_execute}
                        onCheckedChange={(checked) => setData('auto_execute', checked === true)}
                      />
                      <Label htmlFor="auto_execute" className="font-normal cursor-pointer">
                        Automatically create assignment after approval
                      </Label>
                    </div>

                    {data.auto_execute && (
                      <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date (Optional)</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={data.due_date}
                          onChange={(e) => setData('due_date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="flex-1"
                  >
                    <Link href="/requests/pending-approvals">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex-1"
                    variant={
                      data.action === 'approve'
                        ? 'default'
                        : data.action === 'reject'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {processing
                      ? 'Processing...'
                      : data.action === 'approve'
                      ? 'Approve Request'
                      : data.action === 'reject'
                      ? 'Reject Request'
                      : 'Request Changes'
                    }
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
