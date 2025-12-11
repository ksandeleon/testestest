import type { RequestType } from '@/types/request';
import {
  Package,
  ShoppingCart,
  Trash2,
  Wrench,
  ArrowRightLeft,
  HelpCircle
} from 'lucide-react';

interface RequestTypeIconProps {
  type: RequestType;
  className?: string;
}

const typeConfig: Record<RequestType, { icon: typeof Package; label: string; color: string }> = {
  assignment: {
    icon: Package,
    label: 'Assignment',
    color: 'text-blue-600',
  },
  purchase: {
    icon: ShoppingCart,
    label: 'Purchase',
    color: 'text-green-600',
  },
  disposal: {
    icon: Trash2,
    label: 'Disposal',
    color: 'text-red-600',
  },
  maintenance: {
    icon: Wrench,
    label: 'Maintenance',
    color: 'text-orange-600',
  },
  transfer: {
    icon: ArrowRightLeft,
    label: 'Transfer',
    color: 'text-purple-600',
  },
  other: {
    icon: HelpCircle,
    label: 'Other',
    color: 'text-gray-600',
  },
};

export function RequestTypeIcon({ type, className }: RequestTypeIconProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return <Icon className={`${config.color} ${className || ''}`} />;
}

export function getRequestTypeLabel(type: RequestType): string {
  return typeConfig[type].label;
}

export function getRequestTypeConfig(type: RequestType) {
  return typeConfig[type];
}
