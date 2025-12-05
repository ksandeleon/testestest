<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes, TwoFactorAuthenticatable, LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];


    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
            'activated_at' => 'datetime',
            'deactivated_at' => 'datetime',
        ];
    }

    /**
     * Get all assignments for this user.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'user_id');
    }

    /**
     * Get active assignments for this user.
     */
    public function activeAssignments(): HasMany
    {
        return $this->assignments()->where('status', Assignment::STATUS_ACTIVE);
    }

    /**
     * Get items assigned to this user.
     */
    public function assignedItems()
    {
        return $this->hasManyThrough(
            Item::class,
            Assignment::class,
            'user_id', // Foreign key on assignments table
            'id', // Foreign key on items table
            'id', // Local key on users table
            'item_id' // Local key on assignments table
        )->where('assignments.status', Assignment::STATUS_ACTIVE);
    }

    /**
     * Get returns made by this user.
     */
    public function returns(): HasMany
    {
        return $this->hasMany(ItemReturn::class, 'returned_by');
    }

    /**
     * Activity log configuration.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "User {$eventName}");
    }

    /**
     * Scope query to only active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope query to only inactive users.
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Check if user is active.
     */
    public function isActive(): bool
    {
        return $this->is_active && !$this->trashed();
    }

    /**
     * Check if user is inactive.
     */
    public function isInactive(): bool
    {
        return !$this->is_active;
    }

    /**
     * Check if user has any active assignments.
     */
    public function hasActiveAssignments(): bool
    {
        return $this->activeAssignments()->exists();
    }
}
