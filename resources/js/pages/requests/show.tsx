import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestPriorityBadge } from '@/components/requests/request-priority-badge';
import { RequestTypeIcon, getRequestTypeLabel } from '@/components/requests/request-type-icon';
import { CommentThread } from '@/components/requests/comment-thread';
import type { Request } from '@/types/request';
import { Edit, XCircle, Send, ArrowLeft, CheckCircle } from 'lucide-react';

interface ShowRequestProps {
  request: Request;
  can_add_internal_notes: boolean;
}

export default function ShowRequest({ request, can_add_internal_notes }: Readonly<ShowRequestProps>) {
  const { data, setData, post, processing, reset } = useForm({
    comment: '',
    is_internal: false,
  });

  const handleAddComment = (e: React.FormEvent, isInternal = false) => {
    e.preventDefault();
    setData('is_internal', isInternal);

    const endpoint = isInternal
      ? `/requests/${request.id}/internal-note`
      : `/requests/${request.id}/comment`;

    post(endpoint, {
      onSuccess: () => reset('comment'),
    });
  };

  const handleCancelRequest = () => {
    if (confirm('Are you sure you want to cancel this request?')) {
      router.post(`/requests/${request.id}/cancel`, {
        reason: 'Cancelled by user',
      });
    }
  };

  const handleSubmitForReview = () => {
    if (confirm('Submit this request for review?')) {
      router.post(`/requests/${request.id}/submit`);
    }
  };

  return (
    <AppLayout>
      <Head title={`Request: ${request.title}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/requests/my-requests">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{request.title}</h1>
              <p className="text-muted-foreground">Request #{request.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {request.status === 'pending' && (
              <Button onClick={handleSubmitForReview}>
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </Button>
            )}
            {request.can_edit && (
              <Button variant="outline" asChild>
                <Link href={`/requests/${request.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
            {request.can_cancel && (
              <Button variant="destructive" onClick={handleCancelRequest}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Request
              </Button>
            )}
            {request.can_review && (
              <Button asChild>
                <Link href={`/requests/${request.id}/review`}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Review
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <Label className="text-muted-foreground">Requester</Label>
                    <p className="font-medium mt-1">{request.user?.name}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 whitespace-pre-wrap">{request.description}</p>
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

                {request.review_notes && (
                  <div>
                    <Label className="text-muted-foreground">Review Notes</Label>
                    <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm">{request.review_notes}</p>
                      {request.reviewer && (
                        <p className="text-xs text-muted-foreground mt-2">
                          — {request.reviewer.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments & Discussion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CommentThread
                  comments={request.comments || []}
                  showInternal={can_add_internal_notes}
                />

                {/* Add Comment Form */}
                <form onSubmit={(e) => handleAddComment(e, false)} className="space-y-3">
                  <div>
                    <Label htmlFor="comment">Add Comment</Label>
                    <Textarea
                      id="comment"
                      value={data.comment}
                      onChange={(e) => setData('comment', e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    {can_add_internal_notes && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => handleAddComment(e, true)}
                        disabled={processing || !data.comment.trim()}
                      >
                        Add Internal Note
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={processing || !data.comment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Request Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {request.reviewed_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reviewed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.reviewed_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {request.reviewer?.name}
                      </p>
                    </div>
                  </div>
                )}

                {request.completed_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {(request.can_edit || request.can_cancel || request.can_review) && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {request.status === 'pending' && (
                    <Button className="w-full" onClick={handleSubmitForReview}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Review
                    </Button>
                  )}
                  {request.can_edit && (
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/requests/${request.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Request
                      </Link>
                    </Button>
                  )}
                  {request.can_review && (
                    <Button className="w-full" asChild>
                      <Link href={`/requests/${request.id}/review`}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review Request
                      </Link>
                    </Button>
                  )}
                  {request.can_cancel && (
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={handleCancelRequest}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Request
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
