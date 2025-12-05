<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Maintenance extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'item_id',
        'maintenance_type',
        'status',
        'priority',
        'title',
        'description',
        'issue_reported',
        'action_taken',
        'recommendations',
        'estimated_cost',
        'actual_cost',
        'cost_approved',
        'cost_breakdown',
        'scheduled_date',
        'started_at',
        'completed_at',
        'estimated_duration',
        'actual_duration',
        'assigned_to',
        'requested_by',
        'approved_by',
        'attachments',
        'notes',
        'metadata',
        'item_condition_before',
        'item_condition_after',
        'item_status_before',
        'item_status_after',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'cost_approved' => 'boolean',
        'scheduled_date' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'estimated_duration' => 'integer',
        'actual_duration' => 'integer',
        'attachments' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the item that owns the maintenance.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the user assigned to this maintenance.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who requested this maintenance.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved this maintenance.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who created this maintenance record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this maintenance record.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope a query to only include pending maintenance.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include scheduled maintenance.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include in-progress maintenance.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query to only include completed maintenance.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include overdue maintenance.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'completed')
                     ->where('status', '!=', 'cancelled')
                     ->where('scheduled_date', '<', now());
    }

    /**
     * Scope a query to filter by maintenance type.
     */
    public function scopeType($query, string $type)
    {
        return $query->where('maintenance_type', $type);
    }

    /**
     * Scope a query to filter by priority.
     */
    public function scopePriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Mark maintenance as started.
     */
    public function markAsStarted(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
            'item_status_before' => $this->item->status,
            'item_condition_before' => $this->item->condition,
        ]);

        // Update item status to in_maintenance
        $this->item->update(['status' => 'in_maintenance']);
    }

    /**
     * Mark maintenance as completed.
     */
    public function markAsCompleted(array $data = []): void
    {
        $completedAt = now();
        $duration = $this->started_at
            ? $this->started_at->diffInMinutes($completedAt)
            : null;

        $this->update([
            'status' => 'completed',
            'completed_at' => $completedAt,
            'actual_duration' => $duration,
            'action_taken' => $data['action_taken'] ?? $this->action_taken,
            'actual_cost' => $data['actual_cost'] ?? $this->actual_cost,
            'recommendations' => $data['recommendations'] ?? $this->recommendations,
            'item_condition_after' => $data['item_condition_after'] ?? $this->item->condition,
            'item_status_after' => $data['item_status_after'] ?? null,
        ]);

        // Update item status based on maintenance result
        $newStatus = $data['item_status_after'] ?? 'available';
        $newCondition = $data['item_condition_after'] ?? $this->item->condition;

        $this->item->update([
            'status' => $newStatus,
            'condition' => $newCondition,
        ]);
    }

    /**
     * Assign maintenance to a user.
     */
    public function assignTo(User $user): void
    {
        $this->update([
            'assigned_to' => $user->id,
        ]);
    }

    /**
     * Schedule maintenance for a specific date.
     */
    public function scheduleMaintenance(\DateTime $date, int $estimatedDuration = null): void
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_date' => $date,
            'estimated_duration' => $estimatedDuration,
        ]);
    }

    /**
     * Check if maintenance is overdue.
     */
    public function isOverdue(): bool
    {
        if (!$this->scheduled_date) {
            return false;
        }

        return $this->status !== 'completed'
            && $this->status !== 'cancelled'
            && $this->scheduled_date->isPast();
    }

    /**
     * Calculate actual duration in minutes.
     */
    public function calculateDuration(): ?int
    {
        if (!$this->started_at || !$this->completed_at) {
            return null;
        }

        return $this->started_at->diffInMinutes($this->completed_at);
    }

    /**
     * Get cost variance (actual - estimated).
     */
    public function getCostVarianceAttribute(): ?float
    {
        if (!$this->actual_cost || !$this->estimated_cost) {
            return null;
        }

        return $this->actual_cost - $this->estimated_cost;
    }

    /**
     * Get duration variance (actual - estimated).
     */
    public function getDurationVarianceAttribute(): ?int
    {
        if (!$this->actual_duration || !$this->estimated_duration) {
            return null;
        }

        return $this->actual_duration - $this->estimated_duration;
    }

    /**
     * Get status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'secondary',
            'scheduled' => 'default',
            'in_progress' => 'warning',
            'completed' => 'success',
            'cancelled' => 'destructive',
            default => 'secondary',
        };
    }

    /**
     * Get priority badge color.
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'secondary',
            'medium' => 'default',
            'high' => 'warning',
            'critical' => 'destructive',
            default => 'secondary',
        };
    }

    /**
     * Get maintenance type badge color.
     */
    public function getTypeColorAttribute(): string
    {
        return match($this->maintenance_type) {
            'preventive' => 'default',
            'corrective' => 'warning',
            'predictive' => 'secondary',
            'emergency' => 'destructive',
            default => 'secondary',
        };
    }

    /**
     * Activity log configuration.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'item_id',
                'maintenance_type',
                'status',
                'priority',
                'title',
                'description',
                'estimated_cost',
                'actual_cost',
                'scheduled_date',
                'started_at',
                'completed_at',
                'technician_id',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
