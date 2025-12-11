import { Badge } from '@/components/ui/badge';
import type { RequestPriority } from '@/types/request';
import { AlertCircle, ArrowUp, Minus } from 'lucide-react';

interface RequestPriorityBadgeProps {
  priority: RequestPriority;
  className?: string;
  showIcon?: boolean;
}

const priorityConfig: Record<RequestPriority, { label: string; icon: typeof AlertCircle; color: string }> = {
  low: {
    label: 'Low',
    icon: Minus,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  high: {
    label: 'High',
    icon: ArrowUp,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  },
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
};

export function RequestPriorityBadge({ priority, className, showIcon = false }: RequestPriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} ${className || ''}`}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
