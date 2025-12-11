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
import type { Request, RequestType, RequestPriority } from '@/types/request';
import { Search, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface PendingApprovalsProps {
  requests: {
    data: Request[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    type?: RequestType;
    priority?: RequestPriority;
    search?: string;
  };
  statistics: {
    total_pending: number;
    high_priority: number;
    urgent: number;
  };
}

export default function PendingApprovals({ requests, filters, statistics }: Readonly<PendingApprovalsProps>) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleFilterChange = (key: string, value: string) => {
    router.get('/requests/pending-approvals', {
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

  return (
    <AppLayout>
      <Head title="Pending Approvals" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve staff requests
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.high_priority}</div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.urgent}</div>
              <p className="text-xs text-muted-foreground">
                Immediate action required
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter pending requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by title or requester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Priority Filter */}
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => handleFilterChange('priority', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
              Pending Requests ({requests.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.data.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">No pending approvals</p>
                <p className="text-sm text-muted-foreground mt-1">All caught up!</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.data.map((request) => (
                      <TableRow key={request.id} className={request.priority === 'urgent' ? 'bg-red-50' : ''}>
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
                          <div>
                            <p className="text-sm">{request.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{request.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          <RequestPriorityBadge priority={request.priority} showIcon />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(request.requested_at || request.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/requests/${request.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link href={`/requests/${request.id}/review`}>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Review
                              </Link>
                            </Button>
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
                          onClick={() => router.get('/requests/pending-approvals', {
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
                          onClick={() => router.get('/requests/pending-approvals', {
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
