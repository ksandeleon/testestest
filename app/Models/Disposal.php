<?php

namespace App\Models;

use App\Models\Scopes\DisposalScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Disposal extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'item_id',
        'requested_by',
        'approved_by',
        'executed_by',
        'status',
        'reason',
        'description',
        'approval_notes',
        'execution_notes',
        'estimated_value',
        'disposal_cost',
        'disposal_method',
        'recipient',
        'requested_at',
        'approved_at',
        'rejected_at',
        'executed_at',
        'scheduled_for',
        'attachments',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'estimated_value' => 'decimal:2',
        'disposal_cost' => 'decimal:2',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'executed_at' => 'datetime',
        'scheduled_for' => 'datetime',
        'attachments' => 'array',
    ];

    /**
     * Disposal status constants.
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_EXECUTED = 'executed';

    /**
     * Disposal reason constants.
     */
    public const REASON_OBSOLETE = 'obsolete';
    public const REASON_DAMAGED_BEYOND_REPAIR = 'damaged_beyond_repair';
    public const REASON_EXPIRED = 'expired';
    public const REASON_LOST = 'lost';
    public const REASON_STOLEN = 'stolen';
    public const REASON_DONATED = 'donated';
    public const REASON_SOLD = 'sold';
    public const REASON_OTHER = 'other';

    /**
     * Disposal method constants.
     */
    public const METHOD_DESTROY = 'destroy';
    public const METHOD_DONATE = 'donate';
    public const METHOD_SELL = 'sell';
    public const METHOD_RECYCLE = 'recycle';
    public const METHOD_OTHER = 'other';

    /**
     * Get all available statuses.
     *
     * @return array<string>
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_APPROVED,
            self::STATUS_REJECTED,
            self::STATUS_EXECUTED,
        ];
    }

    /**
     * Get all available reasons.
     *
     * @return array<string>
     */
    public static function getReasons(): array
    {
        return [
            self::REASON_OBSOLETE,
            self::REASON_DAMAGED_BEYOND_REPAIR,
            self::REASON_EXPIRED,
            self::REASON_LOST,
            self::REASON_STOLEN,
            self::REASON_DONATED,
            self::REASON_SOLD,
            self::REASON_OTHER,
        ];
    }

    /**
     * Get all available disposal methods.
     *
     * @return array<string>
     */
    public static function getMethods(): array
    {
        return [
            self::METHOD_DESTROY,
            self::METHOD_DONATE,
            self::METHOD_SELL,
            self::METHOD_RECYCLE,
            self::METHOD_OTHER,
        ];
    }

    /**
     * Get the item being disposed.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the user who requested the disposal.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved the disposal.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who executed the disposal.
     */
    public function executedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executed_by');
    }

    /**
     * Scope a query to only include pending disposals.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include approved disposals.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope a query to only include rejected disposals.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Scope a query to only include executed disposals.
     */
    public function scopeExecuted($query)
    {
        return $query->where('status', self::STATUS_EXECUTED);
    }

    /**
     * Check if disposal is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if disposal is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if disposal is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if disposal is executed.
     */
    public function isExecuted(): bool
    {
        return $this->status === self::STATUS_EXECUTED;
    }

    /**
     * Get the activity log options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'status',
                'reason',
                'description',
                'approval_notes',
                'execution_notes',
                'disposal_method',
                'disposal_cost',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
