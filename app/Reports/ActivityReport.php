<?php

namespace App\Reports;

use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

/**
 * Activity Report
 *
 * User actions, system usage, audit trail summary
 */
class ActivityReport extends BaseReport
{
    public function getName(): string
    {
        return 'activity';
    }

    public function getTitle(): string
    {
        return 'Activity Report';
    }

    public function getDescription(): string
    {
        return 'User actions, system usage patterns, and comprehensive audit trail';
    }

    public function generate(array $filters = []): Collection
    {
        [$dateFrom, $dateTo] = $this->getDateRange($filters);

        $query = Activity::query()
            ->with(['causer', 'subject'])
            ->when($filters['causer_id'] ?? null, fn($q, $v) => $q->where('causer_id', $v))
            ->when($filters['subject_type'] ?? null, fn($q, $v) => $q->where('subject_type', $v))
            ->when($filters['event'] ?? null, fn($q, $v) => $q->where('event', $v))
            ->when($dateFrom, fn($q) => $q->where('created_at', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->where('created_at', '<=', $dateTo))
            ->orderBy('created_at', 'desc');

        return $query->get()->map(function ($activity) {
            $subjectType = class_basename($activity->subject_type);
            $subjectId = $activity->subject_id;

            return [
                'performed_by' => $activity->causer?->name ?? 'System',
                'user_email' => $activity->causer?->email ?? 'N/A',
                'action' => $activity->event,
                'description' => $activity->description,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'performed_at' => $activity->created_at->format('Y-m-d H:i:s'),
                'ip_address' => $activity->properties['ip_address'] ?? 'N/A',
            ];
        });
    }

    public function getColumns(): array
    {
        return [
            'performed_by' => 'User',
            'user_email' => 'Email',
            'action' => 'Action',
            'description' => 'Description',
            'subject_type' => 'Entity Type',
            'subject_id' => 'Entity ID',
            'performed_at' => 'Date/Time',
            'ip_address' => 'IP Address',
        ];
    }

    public function getSummary(Collection $data): array
    {
        $byUser = $data->groupBy('performed_by')->map(function ($items, $user) {
            return [
                'user' => $user,
                'action_count' => $items->count(),
            ];
        })->sortByDesc('action_count')->take(10)->values();

        $byAction = $data->groupBy('action')->map(function ($items, $action) use ($data) {
            return [
                'action' => $action,
                'count' => $items->count(),
                'percentage' => $this->formatPercentage(
                    $this->calculatePercentage($items->count(), $data->count())
                ),
            ];
        })->sortByDesc('count')->values();

        $byEntityType = $data->groupBy('subject_type')->map(function ($items, $type) {
            return [
                'entity_type' => $type,
                'count' => $items->count(),
            ];
        })->sortByDesc('count')->values();

        return [
            'total_activities' => $data->count(),
            'unique_users' => $data->pluck('performed_by')->unique()->count(),
            'most_active_users' => $byUser,
            'by_action' => $byAction,
            'by_entity_type' => $byEntityType,
        ];
    }

    public function getAvailableFilters(): array
    {
        return array_merge($this->getCommonDateFilters(), [
            'causer_id' => [
                'type' => 'select',
                'label' => 'User',
                'options' => \App\Models\User::orderBy('name')->pluck('name', 'id'),
            ],
            'subject_type' => [
                'type' => 'select',
                'label' => 'Entity Type',
                'options' => [
                    'App\\Models\\Item' => 'Item',
                    'App\\Models\\Assignment' => 'Assignment',
                    'App\\Models\\Maintenance' => 'Maintenance',
                    'App\\Models\\Disposal' => 'Disposal',
                    'App\\Models\\User' => 'User',
                ],
            ],
            'event' => [
                'type' => 'select',
                'label' => 'Event',
                'options' => [
                    'created' => 'Created',
                    'updated' => 'Updated',
                    'deleted' => 'Deleted',
                ],
            ],
        ]);
    }
}
