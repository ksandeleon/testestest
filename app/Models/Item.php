<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Item extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // IAR & Property Information
        'iar_number',
        'property_number',
        'fund_cluster',

        // Item Description
        'name',
        'description',
        'brand',
        'model',
        'serial_number',
        'specifications',

        // Financial Information
        'acquisition_cost',
        'unit_of_measure',
        'quantity',

        // Classification & Location
        'category_id',
        'location_id',

        // Ownership & Accountability
        'accountable_person_id',
        'accountable_person_name',
        'accountable_person_position',

        // Dates
        'date_acquired',
        'date_inventoried',
        'estimated_useful_life',

        // Status & Condition
        'status',
        'condition',

        // QR Code
        'qr_code',
        'qr_code_path',

        // Tracking
        'created_by',
        'updated_by',
        'remarks',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'acquisition_cost' => 'decimal:2',
        'quantity' => 'integer',
        'date_acquired' => 'date',
        'date_inventoried' => 'date',
        'estimated_useful_life' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Item status constants.
     */
    public const STATUS_AVAILABLE = 'available';
    public const STATUS_ASSIGNED = 'assigned';
    public const STATUS_UNDER_MAINTENANCE = 'under_maintenance';
    public const STATUS_PENDING_DISPOSAL = 'pending_disposal';
    public const STATUS_DISPOSED = 'disposed';
    public const STATUS_DAMAGED = 'damaged';
    public const STATUS_LOST = 'lost';

    /**
     * Get the category that owns the item.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the location where the item is stored.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the user who is accountable for this item.
     */
    public function accountablePerson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accountable_person_id');
    }

    /**
     * Get the user who created this item record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this item record.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all maintenance records for this item.
     */
    public function maintenances(): HasMany
    {
        return $this->hasMany(Maintenance::class);
    }

    /**
     * Get all assignments for this item.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Get all disposals for this item.
     */
    public function disposals(): HasMany
    {
        return $this->hasMany(Disposal::class);
    }

    /**
     * Get the current disposal request for this item.
     */
    public function currentDisposal(): HasOne
    {
        return $this->hasOne(Disposal::class)
            ->whereIn('status', [Disposal::STATUS_PENDING, Disposal::STATUS_APPROVED])
            ->latestOfMany();
    }

    /**
     * Get the current active assignment for this item.
     */
    public function currentAssignment(): HasOne
    {
        return $this->hasOne(Assignment::class)
            ->where('status', Assignment::STATUS_ACTIVE)
            ->latestOfMany();
    }

    /**
     * Get the user who currently has this item assigned.
     */
    public function currentUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'currentAssignment.user_id');
    }

    /**
     * Get the latest maintenance record for this item.
     */
    public function latestMaintenance(): HasOne
    {
        return $this->hasOne(Maintenance::class)->latestOfMany();
    }

    /**
     * Get active (non-completed) maintenance for this item.
     */
    public function activeMaintenance(): HasOne
    {
        return $this->hasOne(Maintenance::class)
            ->whereIn('status', ['pending', 'scheduled', 'in_progress'])
            ->latestOfMany();
    }

    /**
     * Scope a query to only include available items.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include assigned items.
     */
    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by condition.
     */
    public function scopeCondition($query, string $condition)
    {
        return $query->where('condition', $condition);
    }

    /**
     * Scope a query to only include items in maintenance.
     */
    public function scopeInMaintenance($query)
    {
        return $query->where('status', 'in_maintenance');
    }

    /**
     * Get the item's full display name.
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->brand,
            $this->model,
            $this->name,
        ]);

        return implode(' ', $parts);
    }

    /**
     * Get the item's age in years.
     */
    public function getAgeAttribute(): int
    {
        return $this->date_acquired->diffInYears(now());
    }

    /**
     * Check if item is still within useful life.
     */
    public function isWithinUsefulLife(): bool
    {
        if (!$this->estimated_useful_life) {
            return true;
        }

        return now()->lessThanOrEqualTo($this->estimated_useful_life);
    }

    /**
     * Get status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'available' => 'success',
            'assigned', 'in_use' => 'primary',
            'in_maintenance' => 'warning',
            'for_disposal', 'disposed', 'lost' => 'destructive',
            'damaged' => 'destructive',
            default => 'secondary',
        };
    }

    /**
     * Get condition badge color.
     */
    public function getConditionColorAttribute(): string
    {
        return match($this->condition) {
            'excellent', 'good' => 'success',
            'fair' => 'warning',
            'poor', 'for_repair', 'unserviceable' => 'destructive',
            default => 'secondary',
        };
    }

    /**
     * Check if item is currently assigned.
     */
    public function isAssigned(): bool
    {
        return $this->currentAssignment()->exists();
    }

    /**
     * Activity log configuration.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'status',
                'condition',
                'location_id',
                'accountable_person_id',
                'acquisition_cost',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Item {$eventName}");
    }
}