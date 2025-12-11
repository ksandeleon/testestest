<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Request extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * Request Types
     */
    public const TYPE_ASSIGNMENT = 'assignment';
    public const TYPE_PURCHASE = 'purchase';
    public const TYPE_DISPOSAL = 'disposal';
    public const TYPE_MAINTENANCE = 'maintenance';
    public const TYPE_TRANSFER = 'transfer';
    public const TYPE_OTHER = 'other';

    /**
     * Request Statuses
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CHANGES_REQUESTED = 'changes_requested';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Priority Levels
     */
    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_URGENT = 'urgent';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'item_id',
        'title',
        'description',
        'priority',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'metadata',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reviewed_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'can_edit',
        'can_review',
        'can_cancel',
    ];

    /**
     * Determine if the request can be edited by the current user.
     */
    public function getCanEditAttribute(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        return $this->canBeEdited() &&
            ($this->user_id === auth()->id() || auth()->user()->can('requests.update'));
    }

    /**
     * Determine if the request can be reviewed by the current user.
     */
    public function getCanReviewAttribute(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        return $this->canBeReviewed() && auth()->user()->can('requests.approve');
    }

    /**
     * Determine if the request can be cancelled by the current user.
     */
    public function getCanCancelAttribute(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        return $this->canBeCancelled() &&
            ($this->user_id === auth()->id() || auth()->user()->can('requests.delete'));
    }

    /**
     * Get the user who created the request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who reviewed the request.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the item associated with the request (if applicable).
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the comments for the request.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(RequestComment::class);
    }

    /**
     * Get the public comments for the request.
     */
    public function publicComments(): HasMany
    {
        return $this->hasMany(RequestComment::class)->where('is_internal', false);
    }

    /**
     * Get the internal comments for the request.
     */
    public function internalComments(): HasMany
    {
        return $this->hasMany(RequestComment::class)->where('is_internal', true);
    }

    /**
     * Configure activity log options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'type',
                'title',
                'description',
                'priority',
                'status',
                'reviewed_by',
                'review_notes',
                'completed_at',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('request')
            ->setDescriptionForEvent(fn(string $eventName) => match($eventName) {
                'created' => "Request created: {$this->title}",
                'updated' => "Request updated: {$this->title}",
                'deleted' => "Request deleted: {$this->title}",
                default => "Request {$eventName}: {$this->title}",
            });
    }

    /**
     * Scope a query to only include requests with a specific status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include requests under review.
     */
    public function scopeUnderReview($query)
    {
        return $query->where('status', self::STATUS_UNDER_REVIEW);
    }

    /**
     * Scope a query to only include approved requests.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope a query to only include rejected requests.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Scope a query to only include completed requests.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope a query to only include requests for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include requests of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include requests with a specific priority.
     */
    public function scopePriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to only include high priority requests.
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', [self::PRIORITY_HIGH, self::PRIORITY_URGENT]);
    }

    /**
     * Check if the request is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the request is under review.
     */
    public function isUnderReview(): bool
    {
        return $this->status === self::STATUS_UNDER_REVIEW;
    }

    /**
     * Check if the request is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if the request is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if the request is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if the request is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if changes were requested.
     */
    public function hasChangesRequested(): bool
    {
        return $this->status === self::STATUS_CHANGES_REQUESTED;
    }

    /**
     * Check if the request can be edited.
     */
    public function canBeEdited(): bool
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_CHANGES_REQUESTED,
        ]);
    }

    /**
     * Check if the request can be reviewed.
     */
    public function canBeReviewed(): bool
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_UNDER_REVIEW,
            self::STATUS_CHANGES_REQUESTED,
        ]);
    }

    /**
     * Check if the request can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return !in_array($this->status, [
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
        ]);
    }

    /**
     * Get all available request types.
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_ASSIGNMENT,
            self::TYPE_PURCHASE,
            self::TYPE_DISPOSAL,
            self::TYPE_MAINTENANCE,
            self::TYPE_TRANSFER,
            self::TYPE_OTHER,
        ];
    }

    /**
     * Get all available statuses.
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_UNDER_REVIEW,
            self::STATUS_APPROVED,
            self::STATUS_REJECTED,
            self::STATUS_CHANGES_REQUESTED,
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
        ];
    }

    /**
     * Get all available priorities.
     */
    public static function getPriorities(): array
    {
        return [
            self::PRIORITY_LOW,
            self::PRIORITY_MEDIUM,
            self::PRIORITY_HIGH,
            self::PRIORITY_URGENT,
        ];
    }

    /**
     * Get status badge color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_UNDER_REVIEW => 'blue',
            self::STATUS_APPROVED => 'green',
            self::STATUS_REJECTED => 'red',
            self::STATUS_CHANGES_REQUESTED => 'orange',
            self::STATUS_COMPLETED => 'gray',
            self::STATUS_CANCELLED => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get priority badge color for UI.
     */
    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            self::PRIORITY_LOW => 'gray',
            self::PRIORITY_MEDIUM => 'blue',
            self::PRIORITY_HIGH => 'orange',
            self::PRIORITY_URGENT => 'red',
            default => 'gray',
        };
    }
}
