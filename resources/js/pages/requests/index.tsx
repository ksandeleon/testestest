import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestPriorityBadge } from '@/components/requests/request-priority-badge';
import { RequestTypeIcon, getRequestTypeLabel } from '@/components/requests/request-type-icon';
import type { Request, RequestStatus, RequestType, RequestPriority } from '@/types/request';
import { Plus, Search, Eye, Edit, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AllRequestsProps {
  requests: {
    data: Request[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    status?: RequestStatus;
    type?: RequestType;
    priority?: RequestPriority;
    search?: string;
  };
}

export default function AllRequests({ requests, filters }: Readonly<AllRequestsProps>) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleFilterChange = (key: string, value: string) => {
    router.get('/requests', {
      ...filters,
      [key]: value || undefined,
      page: 1,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  const handleCancelRequest = (requestId: number) => {
    if (confirm('Are you sure you want to cancel this request?')) {
      router.post(`/requests/${requestId}/cancel`, {
        reason: 'Cancelled by manager',
      });
    }
  };

  return (
    <AppLayout>
      <Head title="All Requests" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Requests</h1>
            <p className="text-muted-foreground">
              View and manage all staff requests
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter your requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="changes_requested">Changes Requested</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="disposal">Disposal</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Requests ({requests.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No requests found</p>
                <Button asChild>
                  <Link href="/requests/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Request
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.data.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <RequestTypeIcon type={request.type} className="h-5 w-5" />
                            <span className="text-sm">{getRequestTypeLabel(request.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.title}</p>
                            {request.item && (
                              <p className="text-xs text-muted-foreground">
                                {request.item.tag_number} - {request.item.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          <RequestPriorityBadge priority={request.priority} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(request.requested_at || request.created_at), 'MMM dd, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/requests/${request.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {request.can_edit && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/requests/${request.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {request.can_cancel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelRequest(request.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {requests.last_page > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((requests.current_page - 1) * requests.per_page) + 1} to{' '}
                      {Math.min(requests.current_page * requests.per_page, requests.total)} of{' '}
                      {requests.total} requests
                    </p>
                    <div className="flex gap-2">
                      {requests.current_page > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.get('/requests', {
                            ...filters,
                            page: requests.current_page - 1,
                          })}
                        >
                          Previous
                        </Button>
                      )}
                      {requests.current_page < requests.last_page && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.get('/requests', {
                            ...filters,
                            page: requests.current_page + 1,
                          })}
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
