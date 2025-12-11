import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { RequestComment } from '@/types/request';
import { formatDistanceToNow } from 'date-fns';
import { Lock, MessageCircle } from 'lucide-react';

interface CommentThreadProps {
  comments: RequestComment[];
  showInternal?: boolean;
}

export function CommentThread({ comments, showInternal = false }: Readonly<CommentThreadProps>) {
  const displayComments = showInternal
    ? comments
    : comments.filter(comment => !comment.is_internal);

  if (displayComments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="mx-auto h-12 w-12 mb-2 opacity-20" />
        <p>No comments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayComments.map((comment) => (
        <Card key={comment.id} className={`p-4 ${comment.is_internal ? 'bg-amber-50 border-amber-200' : ''}`}>
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {comment.user?.name.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{comment.user?.name || 'Unknown User'}</p>
                  {comment.is_internal && (
                    <Lock className="h-3 w-3 text-amber-600" title="Internal Note" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {comment.attachments.length} attachment(s)
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
