export type RequestType = 'assignment' | 'purchase' | 'disposal' | 'maintenance' | 'transfer' | 'other';

export type RequestStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'completed'
  | 'cancelled';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Request {
  id: number;
  user_id: number;
  type: RequestType;
  item_id?: number;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  requested_at: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  metadata?: Record<string, any>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Relationships
  user?: {
    id: number;
    name: string;
    email: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
  item?: {
    id: number;
    name: string;
    tag_number: string;
    status: string;
  };
  comments?: RequestComment[];
  public_comments?: RequestComment[];

  // Computed properties
  can_edit?: boolean;
  can_review?: boolean;
  can_cancel?: boolean;
  status_color?: string;
  priority_color?: string;
}

export interface RequestComment {
  id: number;
  request_id: number;
  user_id: number;
  comment: string;
  is_internal: boolean;
  attachments?: any[];
  created_at: string;
  updated_at: string;

  // Relationships
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RequestFormData {
  type: RequestType;
  item_id?: number;
  title: string;
  description: string;
  priority: RequestPriority;
  metadata?: Record<string, any>;
}

export interface ReviewFormData {
  action: 'approve' | 'reject' | 'request_changes';
  review_notes: string;
  metadata?: Record<string, any>;
  auto_execute?: boolean;
  due_date?: string;
}

export interface RequestFilters {
  type?: RequestType;
  status?: RequestStatus;
  priority?: RequestPriority;
  user_id?: number;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface RequestStatistics {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
  changes_requested: number;
  by_type: Record<RequestType, number>;
  by_priority: Record<RequestPriority, number>;
}
