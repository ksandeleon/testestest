import { Badge } from '@/components/ui/badge';
import type { RequestStatus } from '@/types/request';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<RequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
  },
  under_review: {
    label: 'Under Review',
    variant: 'default',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
  },
  changes_requested: {
    label: 'Changes Requested',
    variant: 'outline',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'secondary',
  },
};

const statusColors: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  under_review: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  approved: 'bg-green-100 text-green-800 hover:bg-green-100',
  rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
  changes_requested: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  completed: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  cancelled: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
};

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const config = statusConfig[status];
  const colorClass = statusColors[status];

  return (
    <Badge variant={config.variant} className={`${colorClass} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
