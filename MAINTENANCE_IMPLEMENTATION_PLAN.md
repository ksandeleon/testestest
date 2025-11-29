# Maintenance Module Implementation Plan

## Database Layer

### 1. Create `maintenances` table migration
```bash
php artisan make:migration create_maintenances_table
```

**Required fields:**
- `id` - Primary key
- `item_id` - Foreign key to items
- `maintenance_type` - enum: 'preventive', 'corrective', 'predictive', 'emergency'
- `status` - enum: 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
- `priority` - enum: 'low', 'medium', 'high', 'critical'
- `title` - string
- `description` - text
- `issue_reported` - text (what's wrong)
- `action_taken` - text (what was done)
- `cost` - decimal(15,2)
- `scheduled_date` - datetime
- `started_at` - datetime (nullable)
- `completed_at` - datetime (nullable)
- `assigned_to` - Foreign key to users (technician)
- `requested_by` - Foreign key to users
- `approved_by` - Foreign key to users (nullable)
- `attachments` - json (for photos/documents)
- `notes` - text
- `created_by` - Foreign key to users
- `updated_by` - Foreign key to users
- `timestamps`
- `softDeletes`

**Indexes:**
- item_id, status, maintenance_type, assigned_to, scheduled_date

---

## Model Layer

### 2. Create `Maintenance` model
```bash
php artisan make:model Maintenance
```

**Relationships needed:**
- `belongsTo` Item
- `belongsTo` User (assigned_to, requested_by, approved_by, created_by, updated_by)

**Scopes:**
- `scopePending($query)`
- `scopeScheduled($query)`
- `scopeInProgress($query)`
- `scopeCompleted($query)`
- `scopeOverdue($query)` - scheduled_date < now() AND status != 'completed'

**Methods:**
- `markAsStarted()`
- `markAsCompleted()`
- `assignTo(User $user)`
- `isOverdue(): bool`
- `calculateDuration()` - difference between started_at and completed_at

---

### 3. Update `Item` model

Add relationship:
```php
public function maintenances(): HasMany
{
    return $this->hasMany(Maintenance::class);
}

public function latestMaintenance(): HasOne
{
    return $this->hasOne(Maintenance::class)->latestOfMany();
}

public function scopeInMaintenance($query)
{
    return $query->where('status', 'in_maintenance');
}
```

---

## Controller Layer

### 4. Create `MaintenanceController`
```bash
php artisan make:controller MaintenanceController --resource
```

**Methods to implement:**
- `index()` - View all maintenance records with filters
- `show($id)` - View specific maintenance record
- `create()` - Create maintenance request form
- `store()` - Save new maintenance request
- `edit($id)` - Edit maintenance form
- `update($id)` - Update maintenance record
- `destroy($id)` - Delete maintenance record (soft delete)

**Custom methods:**
- `schedule()` - Schedule maintenance
- `start($id)` - Mark maintenance as started
- `complete($id)` - Mark maintenance as completed
- `assign($id)` - Assign maintenance to technician
- `approveCost($id)` - Approve maintenance cost
- `calendar()` - Calendar view of scheduled maintenance
- `export()` - Export maintenance records

---

## Routes Layer

### 5. Add routes to `web.php`

```php
// Maintenance Routes
Route::get('maintenance/calendar', [MaintenanceController::class, 'calendar'])->name('maintenance.calendar');
Route::post('maintenance/{maintenance}/schedule', [MaintenanceController::class, 'schedule'])->name('maintenance.schedule');
Route::post('maintenance/{maintenance}/start', [MaintenanceController::class, 'start'])->name('maintenance.start');
Route::post('maintenance/{maintenance}/complete', [MaintenanceController::class, 'complete'])->name('maintenance.complete');
Route::post('maintenance/{maintenance}/assign', [MaintenanceController::class, 'assign'])->name('maintenance.assign');
Route::post('maintenance/{maintenance}/approve-cost', [MaintenanceController::class, 'approveCost'])->name('maintenance.approve-cost');
Route::get('maintenance/export', [MaintenanceController::class, 'export'])->name('maintenance.export');

// Resource routes
Route::resource('maintenance', MaintenanceController::class);
```

---

## Frontend Layer (React/Inertia)

### 6. Create React Pages

**Pages to create:**
- `resources/js/pages/maintenance/index.tsx` - List all maintenance
- `resources/js/pages/maintenance/show.tsx` - View single maintenance
- `resources/js/pages/maintenance/create.tsx` - Create form
- `resources/js/pages/maintenance/edit.tsx` - Edit form
- `resources/js/pages/maintenance/calendar.tsx` - Calendar view

**Components to create:**
- `MaintenanceCard.tsx` - Display maintenance item
- `MaintenanceStatusBadge.tsx` - Status badge
- `MaintenanceTimeline.tsx` - Timeline of maintenance events
- `MaintenanceCostSummary.tsx` - Cost breakdown
- `AssignTechnicianDialog.tsx` - Assign dialog
- `ScheduleMaintenanceDialog.tsx` - Schedule dialog
- `CompleteMaintenanceDialog.tsx` - Complete dialog with action taken

---

## Seeder Layer

### 7. Create `MaintenanceSeeder`
```bash
php artisan make:seeder MaintenanceSeeder
```

**Sample data:**
- 20-30 maintenance records
- Mix of statuses: pending, scheduled, in_progress, completed
- Different types: preventive, corrective
- Some with costs, some without
- Some overdue

---

## Navigation & Sidebar

### 8. Update Sidebar Navigation

Add to `app-sidebar.tsx`:
```typescript
{
  title: "Maintenance Management",
  icon: Wrench,
  isExpanded: true,
  items: [
    {
      title: "All Maintenance",
      url: route('maintenance.index'),
      icon: List,
    },
    {
      title: "Create Request",
      url: route('maintenance.create'),
      icon: Plus,
    },
    {
      title: "Calendar",
      url: route('maintenance.calendar'),
      icon: Calendar,
    },
  ],
}
```

---

## Additional Features to Consider

### 9. Optional Enhancements

**Email Notifications:**
- When maintenance is assigned
- When maintenance is overdue
- When maintenance is completed
- When high cost needs approval

**Dashboard Widgets:**
- Overdue maintenance count
- Scheduled for today/this week
- Average maintenance cost
- Most maintained items

**Reports:**
- Maintenance cost by category
- Maintenance frequency by item
- Average downtime
- Technician workload

**File Uploads:**
- Before/after photos
- Receipts
- Warranty documents

---

## Implementation Order

1. ✅ **Day 1:** Database migration + Model + Relationships
2. ✅ **Day 2:** Controller + Routes + Basic CRUD
3. ✅ **Day 3:** Frontend pages (index, create, show)
4. ✅ **Day 4:** Advanced features (schedule, assign, complete)
5. ✅ **Day 5:** Calendar view + Dashboard integration
6. ✅ **Day 6:** Testing + Seeder + Polish

---

## Quick Start Command Sequence

```bash
# Create migration
php artisan make:migration create_maintenances_table

# Create model
php artisan make:model Maintenance

# Create controller
php artisan make:controller MaintenanceController --resource

# Create seeder
php artisan make:seeder MaintenanceSeeder

# Create factory (optional)
php artisan make:factory MaintenanceFactory

# Run migration
php artisan migrate

# Seed data
php artisan db:seed --class=MaintenanceSeeder
```

---

## Current Status: READY ✅

You have:
- ✅ Item model with `in_maintenance` status
- ✅ All permissions defined
- ✅ Maintenance coordinator role
- ✅ User relationships
- ✅ Soft deletes infrastructure
- ✅ Cost tracking foundation

**You're ready to start building!** 🚀
