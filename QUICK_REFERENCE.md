# Quick Reference - Assignment & Return System

## 🚀 Quick Start

### Check if Everything Works
```bash
# Check migrations
php artisan migrate:status

# Test assignment creation
php artisan tinker
>>> use App\Services\AssignmentService;
>>> $service = new AssignmentService();
>>> $service->getAssignmentSummary();
```

---

## 📍 Key Routes

### Staff Users (View Their Items)
```
GET /assignments/my-assignments   - My borrowed items
GET /items                        - Only my assigned items (auto-filtered)
GET /returns/my-returns           - My return history
```

### Admins (Manage Everything)
```
GET  /assignments                 - All assignments
POST /assignments                 - Create assignment
GET  /assignments/overdue         - Overdue items
POST /assignments/bulk-assign     - Assign multiple items

GET  /returns                     - All returns  
GET  /returns/pending-inspections - Items to inspect
GET  /returns/damaged             - Damaged items
GET  /returns/late                - Late returns
```

---

## 💻 Common Use Cases

### 1. Assign Item to User
```php
use App\Services\AssignmentService;

$service = new AssignmentService();
$assignment = $service->createAssignment([
    'item_id' => 1,
    'user_id' => 5,
    'assigned_by' => auth()->id(),
    'assigned_date' => now(),
    'due_date' => now()->addDays(30),
    'purpose' => 'Office work',
]);
```

### 2. Return Item
```php
use App\Services\ReturnService;

$service = new ReturnService();
$return = $service->createReturn($assignment, [
    'returned_by' => auth()->id(),
    'condition_on_return' => 'good',
    'return_notes' => 'All accessories included',
]);
```

### 3. Quick Return (Good Condition)
```php
$return = $service->quickReturn($assignment, auth()->user(), 'good');
// Auto-approved!
```

### 4. Get User's Active Assignments
```php
$user = User::find(5);
$items = $user->activeAssignments;
// or
$items = $user->assignedItems;
```

### 5. Check if Item is Assigned
```php
$item = Item::find(1);
if ($item->isAssigned()) {
    $user = $item->currentUser;
    echo "Assigned to: {$user->name}";
}
```

---

## 🔍 Query Scopes

### Assignments
```php
// Active assignments only
Assignment::active()->get();

// Overdue assignments
Assignment::overdue()->get();

// Pending approval
Assignment::pending()->get();

// User's assignments
Assignment::forUser($userId)->get();

// Item's assignment history
Assignment::forItem($itemId)->get();
```

### Returns
```php
// Pending inspection
ItemReturn::pendingInspection()->get();

// Damaged items
ItemReturn::damaged()->get();

// Late returns
ItemReturn::late()->get();

// Approved returns
ItemReturn::approved()->get();
```

---

## 📊 Get Statistics

### Assignment Stats
```php
use App\Services\AssignmentService;

$service = new AssignmentService();
$stats = $service->getAssignmentSummary();
// Returns: total, active, pending, returned, overdue, cancelled
```

### Return Stats
```php
use App\Services\ReturnService;

$service = new ReturnService();
$stats = $service->getReturnStatistics();
// Returns: total, pending_inspection, damaged, late, penalties, etc.
```

### User Stats
```php
$stats = $service->getUserAssignmentStats($userId);
// Returns: total, active, returned, overdue
```

---

## 🎨 Permission Checks

### In Controllers
```php
$this->authorize('assignments.view_any');
$this->authorize('assignments.create');
$this->authorize('returns.inspect');
```

### In Blade/Inertia
```php
@can('assignments.create')
    <button>New Assignment</button>
@endcan

// Inertia (Vue/React)
<button v-if="$page.props.auth.permissions.includes('assignments.create')">
    New Assignment
</button>
```

---

## 🔄 Status Flows

### Assignment Statuses
```
pending → approved → active → returned
                  ↘ cancelled
```

### Return Statuses
```
pending_inspection → inspected → approved
                              ↘ rejected
```

---

## 🧪 Testing Data

### Create Test Assignments
```php
// In tinker
Assignment::factory()->active()->count(5)->create();
Assignment::factory()->overdue()->count(3)->create();
Assignment::factory()->returned()->count(2)->create();
```

### Create Test Returns
```php
ItemReturn::factory()->damaged()->create();
ItemReturn::factory()->late()->create();
```

---

## 🛠️ Maintenance Commands

### Clear Activity Logs (if needed)
```bash
php artisan activitylog:clean
```

### Reset and Seed
```bash
php artisan migrate:fresh --seed
```

### Check Routes
```bash
php artisan route:list --name=assignments
php artisan route:list --name=returns
```

---

## 🐛 Troubleshooting

### "Item already assigned" error
```php
// Check if item is available first
if (!$service->isItemCurrentlyAssigned($itemId)) {
    // OK to assign
}
```

### "Assignment already returned" error
```php
// Check status first
if ($assignment->isActive()) {
    // OK to return
}
```

### Staff user sees all items
```php
// Make sure user has 'staff' role
$user->hasRole('staff'); // should be true

// Check in ItemController::index()
// It should call staffItemsView() automatically
```

---

## 📝 Constants Reference

### Assignment Statuses
```php
Assignment::STATUS_PENDING
Assignment::STATUS_APPROVED
Assignment::STATUS_ACTIVE
Assignment::STATUS_RETURNED
Assignment::STATUS_CANCELLED
```

### Assignment Conditions
```php
Assignment::CONDITION_GOOD
Assignment::CONDITION_FAIR
Assignment::CONDITION_POOR
```

### Return Statuses
```php
ItemReturn::STATUS_PENDING_INSPECTION
ItemReturn::STATUS_INSPECTED
ItemReturn::STATUS_APPROVED
ItemReturn::STATUS_REJECTED
```

### Return Conditions
```php
ItemReturn::CONDITION_GOOD
ItemReturn::CONDITION_FAIR
ItemReturn::CONDITION_POOR
ItemReturn::CONDITION_DAMAGED
```

---

## 🎯 Next Steps

### Frontend Tasks
1. Create Inertia/Vue components for:
   - Assignment form
   - My Assignments view (staff)
   - Return form
   - Inspection form
   - Dashboard stats widgets

2. Add notifications:
   - Email on assignment
   - Reminder for due dates
   - Alert for overdue items

3. Implement exports:
   - Assignment reports (Excel/PDF)
   - Return reports
   - Activity logs

### Backend Enhancements
1. File uploads for damage photos
2. Email notifications
3. Scheduled commands for reminders
4. Advanced reporting

---

## 📖 Documentation

- `IMPLEMENTATION_SUMMARY.md` - This file
- `ASSIGNMENT_RETURN_IMPLEMENTATION.md` - Detailed technical docs
- `USER_PERMISSION_ANALYSIS.md` - Permission system analysis

---

**Need help? Check the service methods - they're fully documented with PHPDoc!** 🚀
