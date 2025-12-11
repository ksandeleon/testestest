<?php

namespace App\Reports;

use App\Models\Assignment;
use Illuminate\Support\Collection;

/**
 * User Assignments Report
 *
 * Shows who has what items, assignment duration, overdue items
 */
class UserAssignmentsReport extends BaseReport
{
    public function getName(): string
    {
        return 'user_assignments';
    }

    public function getTitle(): string
    {
        return 'User Assignments Report';
    }

    public function getDescription(): string
    {
        return 'Current and historical assignments, who has what items, overdue tracking';
    }

    public function generate(array $filters = []): Collection
    {
        [$dateFrom, $dateTo] = $this->getDateRange($filters);

        $query = Assignment::query()
            ->with(['user', 'item.category', 'assignedBy'])
            ->when($filters['user_id'] ?? null, fn($q, $v) => $q->where('user_id', $v))
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['is_overdue'] ?? null, fn($q, $v) => $q->where('is_overdue', $v))
            ->when($dateFrom, fn($q) => $q->where('assigned_at', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->where('assigned_at', '<=', $dateTo))
            ->orderBy('assigned_at', 'desc');

        return $query->get()->map(function ($assignment) {
            return [
                'user_name' => $assignment->user?->name ?? 'N/A',
                'user_email' => $assignment->user?->email ?? 'N/A',
                'item_name' => $assignment->item->name,
                'property_number' => $assignment->item->property_number,
                'category' => $assignment->item->category?->name ?? 'N/A',
                'assigned_at' => $assignment->assigned_at,
                'due_date' => $assignment->due_date,
                'returned_at' => $assignment->returned_at,
                'status' => $assignment->status,
                'is_overdue' => $assignment->is_overdue,
                'assigned_by' => $assignment->assignedBy?->name ?? 'N/A',
                'duration_days' => $assignment->returned_at
                    ? $assignment->assigned_at->diffInDays($assignment->returned_at)
                    : $assignment->assigned_at->diffInDays(now()),
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'user_name' => 'User Name',
            'user_email' => 'Email',
            'item_name' => 'Item',
            'property_number' => 'Property Number',
            'category' => 'Category',
            'assigned_at' => 'Assigned Date',
            'due_date' => 'Due Date',
            'returned_at' => 'Returned Date',
            'status' => 'Status',
            'is_overdue' => 'Overdue',
            'assigned_by' => 'Assigned By',
            'duration_days' => 'Duration (Days)',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $totalAssignments = $data->count();
        $activeAssignments = $data->where('status', 'active')->count();
        $overdueAssignments = $data->where('is_overdue', true)->count();
        $completedAssignments = $data->where('status', 'completed')->count();

        return [
            'total_assignments' => $totalAssignments,
            'active_assignments' => $activeAssignments,
            'overdue_assignments' => $overdueAssignments,
            'completed_assignments' => $completedAssignments,
            'average_duration_days' => round($data->avg('duration_days'), 2),
        ];
    }

    public function getAvailableFilters(): array
    {
        return array_merge($this->getCommonDateFilters(), [
            'user_id' => [
                'type' => 'select',
                'label' => 'User',
                'options' => \App\Models\User::orderBy('name')->pluck('name', 'id'),
            ],
            'status' => [
                'type' => 'select',
                'label' => 'Status',
                'options' => [
                    'active' => 'Active',
                    'completed' => 'Completed',
                    'cancelled' => 'Cancelled',
                ],
            ],
            'is_overdue' => [
                'type' => 'select',
                'label' => 'Overdue Only',
                'options' => [
                    '1' => 'Yes',
                    '0' => 'No',
                ],
            ],
        ]);
    }
}
