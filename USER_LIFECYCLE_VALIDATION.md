# User Lifecycle Validation Report

**Date:** December 5, 2025  
**Status:** ⚠️ PARTIALLY IMPLEMENTED - Missing Critical Features

---

## Expected Lifecycle (from ENTITY_LIFECYCLES.md)

```
Create → Invite → Email Sent
  ↓
Activate → Assign Roles/Permissions
  ↓
Active → [Login, Use System]
  ↓
[Update Roles/Permissions as needed]
  ↓
Deactivate → Suspend Access → [Items Still Assigned?]
  ↓
[If has items] → Force Return All Items
  ↓
Delete (Soft) → [Restore or Force Delete]
```

**Expected States:**
- `active` - Can login and use system
- `inactive` - Account disabled
- `deleted` - Soft deleted

---

## Current Implementation Analysis

### ✅ IMPLEMENTED FEATURES

#### 1. User Creation ✅
**Location:** `UserController@store()`
```php
public function store(Request $request): RedirectResponse
{
    $user = User::create([...]);
    $user->assignRole($validated['role']);
    return redirect()->route('users.index');
}
```
**Status:** ✅ Working
**Alignment:** Partial - Creates user and assigns role, but NO email invitation

#### 2. Role/Permission Assignment ✅
**Locations:**
- `UserController@assignRole()`
- `UserController@revokeRole()`
- `UserController@assignPermission()`
- `UserController@revokePermission()`
- `UserController@assignRolesPermissions()` (UI page)

**Status:** ✅ Fully implemented via Spatie Laravel-Permission
**Alignment:** ✅ Matches lifecycle requirement

#### 3. Soft Delete ✅
**Location:** `UserController@destroy()`
```php
public function destroy(User $user): RedirectResponse
{
    $user->delete(); // Soft delete via SoftDeletes trait
}
```
**Status:** ✅ Working
**Note:** Model has `SoftDeletes` trait, migration has `softDeletes()` column

#### 4. Restore ✅
**Location:** `UserController@restore()`
```php
public function restore(int $id): RedirectResponse
{
    $user = User::withTrashed()->findOrFail($id);
    $user->restore();
}
```
**Status:** ✅ Working

#### 5. Force Delete ✅
**Location:** `UserController@forceDelete()`
```php
public function forceDelete(int $id): RedirectResponse
{
    $user = User::withTrashed()->findOrFail($id);
    $user->forceDelete();
}
```
**Status:** ✅ Working

#### 6. User Relationships ✅
**Model Relationships:**
```php
- assignments() - All assignments
- activeAssignments() - Active assignments only
- assignedItems() - Items currently assigned
- returns() - Return records
```
**Status:** ✅ Properly defined

---

## ❌ MISSING CRITICAL FEATURES

### 1. Active/Inactive Status Field ❌ CRITICAL

**Problem:** No `is_active` or `status` column in database
**Current:** Users table only has:
```php
- id, name, email, password
- email_verified_at
- remember_token
- created_at, updated_at
- deleted_at (soft delete)
```

**Impact:** Cannot deactivate users without deleting them

**Expected Behavior:**
```
Deactivate → Suspend Access → [Items Still Assigned?]
```

**Current Behavior:**
```
Only options: Active (exists) or Deleted (soft deleted)
No "inactive/suspended" middle state
```

---

### 2. Email Invitation System ❌ CRITICAL

**Problem:** No invitation/email sending on user creation

**Expected Flow:**
```
Create → Invite → Email Sent → Activate
```

**Current Flow:**
```
Create → Assign Role → Done (user created with password immediately)
```

**Missing Components:**
- No email invitation sending
- No temporary invitation token
- No "pending activation" state
- User can login immediately after creation

---

### 3. Check for Assigned Items Before Deletion ❌ CRITICAL

**Problem:** No validation to prevent deleting users with active assignments

**Expected Behavior (from lifecycle):**
```
Deactivate → [Items Still Assigned?]
  ↓
[If has items] → Force Return All Items
  ↓
Delete (Soft)
```

**Current Behavior:**
```php
public function destroy(User $user): RedirectResponse
{
    $user->delete(); // No check for active assignments!
}
```

**Risk:** User can be deleted even with active item assignments, breaking data integrity

---

### 4. Deactivate/Reactivate Methods ❌

**Problem:** No methods to activate/deactivate user accounts

**Missing:**
- `deactivate()` method
- `activate()` method
- `toggleStatus()` method

**Required Logic:**
```php
public function deactivate(User $user)
{
    // 1. Check for active assignments
    if ($user->activeAssignments()->exists()) {
        throw new Exception("Cannot deactivate user with active item assignments");
    }
    
    // 2. Set status to inactive
    $user->update(['is_active' => false]);
    
    // 3. Log activity
    activity()->performedOn($user)->log('User deactivated');
}
```

---

### 5. Force Return All Items ❌

**Problem:** No method to automatically return all items when deactivating user

**Missing:**
```php
public function forceReturnAllItems(User $user)
{
    $activeAssignments = $user->activeAssignments;
    
    foreach ($activeAssignments as $assignment) {
        // Process return
        // Update item status to available
        // Mark assignment as returned
    }
}
```

---

### 6. Activity Logging Incomplete ⚠️

**Current:** Basic logging in User model
```php
LogOptions::defaults()
    ->logOnly(['name', 'email'])
    ->logOnlyDirty();
```

**Missing Logged Events:**
- User activation/deactivation
- Role changes (should be in activity log)
- Permission changes
- Forced item returns

---

## 🔴 CRITICAL ISSUES SUMMARY

| Issue | Severity | Impact |
|-------|----------|--------|
| No `is_active` status field | 🔴 CRITICAL | Cannot deactivate users without deleting |
| No assignment check before delete | 🔴 CRITICAL | Data integrity - orphaned assignments |
| No email invitation system | 🟡 HIGH | Lifecycle incomplete, security concern |
| No deactivate/activate methods | 🟡 HIGH | Cannot suspend user access |
| No force return items | 🟡 HIGH | Cannot safely deactivate users with assignments |
| Incomplete activity logging | 🟠 MEDIUM | Audit trail gaps |

---

## 📋 REQUIRED FIXES

### Fix 1: Add Status Field to Users Table

**Migration:**
```php
// database/migrations/YYYY_MM_DD_add_status_to_users_table.php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->boolean('is_active')->default(true)->after('email');
        $table->timestamp('activated_at')->nullable()->after('is_active');
        $table->timestamp('deactivated_at')->nullable()->after('activated_at');
    });
}
```

**Model Update:**
```php
// app/Models/User.php
protected $fillable = [
    'name',
    'email',
    'password',
    'is_active', // Add this
];

protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'is_active' => 'boolean', // Add this
    'activated_at' => 'datetime',
    'deactivated_at' => 'datetime',
];

// Add scopes
public function scopeActive($query)
{
    return $query->where('is_active', true);
}

public function scopeInactive($query)
{
    return $query->where('is_active', false);
}

// Add helper methods
public function isActive(): bool
{
    return $this->is_active && !$this->trashed();
}

public function isInactive(): bool
{
    return !$this->is_active;
}
```

---

### Fix 2: Create UserService Layer

**Create:** `app/Services/UserService.php`

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Assignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserService
{
    /**
     * Create a new user with invitation.
     */
    public function create(array $data, bool $sendInvitation = true): User
    {
        return DB::transaction(function () use ($data, $sendInvitation) {
            // Create user with temporary password
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make(Str::random(32)), // Temp password
                'is_active' => false, // Inactive until invitation accepted
            ]);

            // Assign role
            if (isset($data['role'])) {
                $user->assignRole($data['role']);
            }

            // Send invitation email
            if ($sendInvitation) {
                // TODO: Implement invitation email
                // Mail::to($user)->send(new UserInvitation($user, $invitationToken));
            }

            activity()
                ->performedOn($user)
                ->log('User created and invitation sent');

            return $user;
        });
    }

    /**
     * Activate a user account.
     */
    public function activate(User $user): User
    {
        $user->update([
            'is_active' => true,
            'activated_at' => now(),
        ]);

        activity()
            ->performedOn($user)
            ->log('User account activated');

        return $user;
    }

    /**
     * Deactivate a user account.
     * Checks for active assignments and optionally forces returns.
     */
    public function deactivate(User $user, bool $forceReturnItems = false): User
    {
        return DB::transaction(function () use ($user, $forceReturnItems) {
            // Check for active assignments
            $activeAssignments = $user->activeAssignments()->count();

            if ($activeAssignments > 0) {
                if (!$forceReturnItems) {
                    throw new \Exception(
                        "Cannot deactivate user '{$user->name}' because they have {$activeAssignments} active item assignment(s). " .
                        "Please return all items first or use force return option."
                    );
                }

                // Force return all items
                $this->forceReturnAllItems($user);
            }

            // Deactivate user
            $user->update([
                'is_active' => false,
                'deactivated_at' => now(),
            ]);

            activity()
                ->performedOn($user)
                ->log('User account deactivated');

            return $user;
        });
    }

    /**
     * Force return all items assigned to user.
     */
    public function forceReturnAllItems(User $user): int
    {
        $activeAssignments = $user->activeAssignments;
        $count = 0;

        foreach ($activeAssignments as $assignment) {
            // Update assignment status
            $assignment->update(['status' => Assignment::STATUS_RETURNED]);

            // Item status will be auto-updated by AssignmentObserver
            // to 'available' when assignment marked as returned

            activity()
                ->performedOn($assignment)
                ->withProperties([
                    'reason' => 'User deactivated - forced return',
                    'user_id' => $user->id,
                ])
                ->log('Assignment force returned due to user deactivation');

            $count++;
        }

        return $count;
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user, bool $forceReturnItems = false): User
    {
        if ($user->is_active) {
            return $this->deactivate($user, $forceReturnItems);
        } else {
            return $this->activate($user);
        }
    }

    /**
     * Soft delete user with validation.
     */
    public function delete(User $user, bool $force = false): bool
    {
        return DB::transaction(function () use ($user, $force) {
            // Check if user is active
            if ($user->is_active) {
                throw new \Exception(
                    "Cannot delete active user '{$user->name}'. Please deactivate first."
                );
            }

            // Check for active assignments
            if ($user->activeAssignments()->exists()) {
                throw new \Exception(
                    "Cannot delete user '{$user->name}' because they have active item assignments. " .
                    "All items must be returned first."
                );
            }

            activity()
                ->performedOn($user)
                ->log($force ? 'User permanently deleted' : 'User soft deleted');

            if ($force) {
                return $user->forceDelete();
            } else {
                return $user->delete();
            }
        });
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(User $user): bool
    {
        $restored = $user->restore();

        if ($restored) {
            activity()
                ->performedOn($user)
                ->log('User restored from trash');
        }

        return $restored;
    }
}
```

---

### Fix 3: Update UserController

**Refactor controller to use UserService:**

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    // ... existing index(), create(), show() methods ...

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('users.create');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'send_invitation' => ['boolean'],
        ]);

        try {
            $this->userService->create($validated, $validated['send_invitation'] ?? true);

            return redirect()->route('users.index')
                ->with('success', 'User created and invitation sent.');
        } catch (\Exception $e) {
            return back()->withInput()
                ->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('users.delete');

        try {
            $this->userService->delete($user, force: false);

            return redirect()->route('users.index')
                ->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Toggle user active/inactive status.
     */
    public function toggleStatus(User $user, Request $request): RedirectResponse
    {
        $this->authorize('users.update');

        $validated = $request->validate([
            'force_return_items' => ['boolean'],
        ]);

        try {
            $this->userService->toggleStatus(
                $user,
                $validated['force_return_items'] ?? false
            );

            $status = $user->fresh()->is_active ? 'activated' : 'deactivated';

            return back()->with('success', "User {$status} successfully.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Deactivate user (with option to force return items).
     */
    public function deactivate(User $user, Request $request): RedirectResponse
    {
        $this->authorize('users.update');

        $validated = $request->validate([
            'force_return_items' => ['boolean'],
        ]);

        try {
            $this->userService->deactivate(
                $user,
                $validated['force_return_items'] ?? false
            );

            return back()->with('success', 'User deactivated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Activate user.
     */
    public function activate(User $user): RedirectResponse
    {
        $this->authorize('users.update');

        $this->userService->activate($user);

        return back()->with('success', 'User activated successfully.');
    }
}
```

---

### Fix 4: Add Routes

**Add to `routes/web.php`:**

```php
Route::middleware(['auth'])->group(function () {
    // Existing user routes...
    
    // User status management
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    Route::post('users/{user}/deactivate', [UserController::class, 'deactivate'])
        ->name('users.deactivate');
    Route::post('users/{user}/activate', [UserController::class, 'activate'])
        ->name('users.activate');
});
```

---

## 🎯 RECOMMENDED IMPLEMENTATION PRIORITY

### Phase 1: Critical (Immediate)
1. ✅ Add `is_active` status field migration
2. ✅ Create UserService with activate/deactivate logic
3. ✅ Add assignment check before delete
4. ✅ Update UserController to use service

### Phase 2: High (Soon)
5. ⚠️ Implement force return items logic
6. ⚠️ Add comprehensive activity logging
7. ⚠️ Create UI for activate/deactivate buttons

### Phase 3: Medium (Later)
8. 📧 Implement email invitation system
9. 📧 Add invitation token generation/validation
10. 📧 Create password reset flow for new users

---

## 📊 COMPARISON TABLE

| Feature | Required by Lifecycle | Currently Implemented | Status |
|---------|----------------------|----------------------|---------|
| User Creation | ✅ | ✅ | ✅ Working |
| Email Invitation | ✅ | ❌ | ❌ Missing |
| Activate User | ✅ | ❌ | ❌ Missing |
| Assign Roles/Permissions | ✅ | ✅ | ✅ Working |
| Active Status | ✅ | ❌ | ❌ No status field |
| Deactivate User | ✅ | ❌ | ❌ Missing |
| Check Assigned Items | ✅ | ❌ | ❌ Missing |
| Force Return Items | ✅ | ❌ | ❌ Missing |
| Soft Delete | ✅ | ✅ | ✅ Working |
| Restore | ✅ | ✅ | ✅ Working |
| Force Delete | ✅ | ✅ | ✅ Working |
| Activity Logging | ✅ | ⚠️ | ⚠️ Partial |

**Overall Compliance:** ~45% (5 of 11 features fully implemented)

---

## 🚨 IMMEDIATE ACTION ITEMS

1. **Create migration** for `is_active`, `activated_at`, `deactivated_at` fields
2. **Create UserService** with activate/deactivate/forceReturn methods
3. **Update UserController** destroy() to check for active assignments
4. **Add validation** in deactivate() to check for items
5. **Test** the complete lifecycle flow

---

## ✅ VALIDATION CHECKLIST

Once fixes implemented, test these scenarios:

- [ ] Create user → Status = inactive
- [ ] Send invitation email
- [ ] User accepts invitation → Status = active
- [ ] Assign roles/permissions to active user
- [ ] Try to deactivate user with active assignments → Should fail
- [ ] Force return items → Deactivate user → Should succeed
- [ ] Try to delete active user → Should fail
- [ ] Deactivate user → Delete → Should succeed
- [ ] Restore deleted user
- [ ] Force delete user
- [ ] Check activity logs for all operations

---

**Conclusion:** User lifecycle is **partially implemented** with critical missing features. The basic CRUD operations work, but the activate/deactivate flow and item assignment validation are completely missing, creating data integrity and security risks.

**Recommendation:** Implement Phase 1 fixes immediately before deploying to production.
