<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Assignment extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'item_id',
        'user_id',
        'assigned_by',
        'status',
        'assigned_date',
        'due_date',
        'returned_date',
        'purpose',
        'notes',
        'admin_notes',
        'condition_on_assignment',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_date' => 'date',
        'due_date' => 'date',
        'returned_date' => 'date',
    ];

    /**
     * Assignment statuses
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_RETURNED = 'returned';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_ACTIVE,
        self::STATUS_RETURNED,
        self::STATUS_CANCELLED,
    ];

    /**
     * Condition types
     */
    public const CONDITION_GOOD = 'good';
    public const CONDITION_FAIR = 'fair';
    public const CONDITION_POOR = 'poor';

    /**
     * Get the item that is assigned.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the user to whom the item is assigned.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who assigned the item.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the return record for this assignment.
     */
    public function return(): HasOne
    {
        return $this->hasOne(ItemReturn::class);
    }

    /**
     * Scope a query to only include active assignments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope a query to only include pending assignments.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include returned assignments.
     */
    public function scopeReturned($query)
    {
        return $query->where('status', self::STATUS_RETURNED);
    }

    /**
     * Scope a query to only include overdue assignments.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->whereNotNull('due_date')
            ->where('due_date', '<', now());
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by item.
     */
    public function scopeForItem($query, $itemId)
    {
        return $query->where('item_id', $itemId);
    }

    /**
     * Check if assignment is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->due_date
            && $this->due_date->isPast();
    }

    /**
     * Check if assignment is active.
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if assignment is returned.
     */
    public function isReturned(): bool
    {
        return $this->status === self::STATUS_RETURNED;
    }

    /**
     * Mark assignment as returned.
     */
    public function markAsReturned(): void
    {
        $this->update([
            'status' => self::STATUS_RETURNED,
            'returned_date' => now(),
        ]);
    }

    /**
     * Approve assignment.
     */
    public function approve(): void
    {
        $this->update(['status' => self::STATUS_APPROVED]);
    }

    /**
     * Cancel assignment.
     */
    public function cancel(): void
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    /**
     * Activate assignment.
     */
    public function activate(): void
    {
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    /**
     * Get days until due or days overdue.
     */
    public function getDaysUntilDue(): ?int
    {
        if (!$this->due_date) {
            return null;
        }

        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Activity log configuration.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'item_id',
                'user_id',
                'assigned_by',
                'status',
                'assigned_date',
                'due_date',
                'purpose',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Assignment {$eventName}");
    }
}
