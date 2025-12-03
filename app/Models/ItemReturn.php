<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ItemReturn extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'returns';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'assignment_id',
        'returned_by',
        'inspected_by',
        'status',
        'return_date',
        'inspection_date',
        'condition_on_return',
        'is_damaged',
        'damage_description',
        'damage_images',
        'is_late',
        'days_late',
        'return_notes',
        'inspection_notes',
        'penalty_amount',
        'penalty_paid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'return_date' => 'datetime',
        'inspection_date' => 'datetime',
        'damage_images' => 'array',
        'is_damaged' => 'boolean',
        'is_late' => 'boolean',
        'penalty_paid' => 'boolean',
        'penalty_amount' => 'decimal:2',
    ];

    /**
     * Return statuses
     */
    public const STATUS_PENDING_INSPECTION = 'pending_inspection';
    public const STATUS_INSPECTED = 'inspected';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const STATUSES = [
        self::STATUS_PENDING_INSPECTION,
        self::STATUS_INSPECTED,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

    /**
     * Condition types
     */
    public const CONDITION_GOOD = 'good';
    public const CONDITION_FAIR = 'fair';
    public const CONDITION_POOR = 'poor';
    public const CONDITION_DAMAGED = 'damaged';

    public const CONDITIONS = [
        self::CONDITION_GOOD,
        self::CONDITION_FAIR,
        self::CONDITION_POOR,
        self::CONDITION_DAMAGED,
    ];

    /**
     * Get the assignment that this return belongs to.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the user who returned the item.
     */
    public function returnedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by');
    }

    /**
     * Get the user who inspected the return.
     */
    public function inspectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    /**
     * Scope a query to only include pending inspections.
     */
    public function scopePendingInspection($query)
    {
        return $query->where('status', self::STATUS_PENDING_INSPECTION);
    }

    /**
     * Scope a query to only include inspected returns.
     */
    public function scopeInspected($query)
    {
        return $query->where('status', self::STATUS_INSPECTED);
    }

    /**
     * Scope a query to only include approved returns.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope a query to only include damaged returns.
     */
    public function scopeDamaged($query)
    {
        return $query->where('is_damaged', true);
    }

    /**
     * Scope a query to only include late returns.
     */
    public function scopeLate($query)
    {
        return $query->where('is_late', true);
    }

    /**
     * Check if return is pending inspection.
     */
    public function isPendingInspection(): bool
    {
        return $this->status === self::STATUS_PENDING_INSPECTION;
    }

    /**
     * Check if return is inspected.
     */
    public function isInspected(): bool
    {
        return $this->status === self::STATUS_INSPECTED;
    }

    /**
     * Check if return is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if item is damaged.
     */
    public function isDamaged(): bool
    {
        return $this->is_damaged;
    }

    /**
     * Mark as inspected.
     */
    public function markAsInspected(User $inspector, array $data = []): void
    {
        $this->update([
            'status' => self::STATUS_INSPECTED,
            'inspected_by' => $inspector->id,
            'inspection_date' => now(),
            'inspection_notes' => $data['inspection_notes'] ?? null,
            'is_damaged' => $data['is_damaged'] ?? false,
            'damage_description' => $data['damage_description'] ?? null,
        ]);
    }

    /**
     * Approve return.
     */
    public function approve(): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
        ]);
    }

    /**
     * Reject return.
     */
    public function reject(): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
        ]);
    }

    /**
     * Calculate late days based on assignment due date.
     */
    public function calculateLateDays(): void
    {
        if (!$this->assignment || !$this->assignment->due_date) {
            return;
        }

        $dueDate = $this->assignment->due_date;
        $returnDate = $this->return_date;

        if ($returnDate->greaterThan($dueDate)) {
            $this->update([
                'is_late' => true,
                'days_late' => $dueDate->diffInDays($returnDate),
            ]);
        }
    }

    /**
     * Activity log configuration.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'assignment_id',
                'status',
                'condition_on_return',
                'is_damaged',
                'is_late',
                'penalty_amount',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Return {$eventName}");
    }
}
