# User Interface Updates - User Status Management

## Overview
Updated the Users index page (`resources/js/pages/users/index.tsx`) to support the new user status management features implemented in the backend.

## Changes Made

### 1. TypeScript Interface Updates
**File:** `resources/js/pages/users/index.tsx`

Added new fields to the User interface:
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    is_active: boolean;               // ✨ NEW
    activated_at: string | null;      // ✨ NEW
    deactivated_at: string | null;    // ✨ NEW
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    roles: Role[];
}
```

### 2. Component State Management
Added state for:
- **Notifications**: Success/error messages after actions
- **Deactivate Dialog**: Confirmation dialog with force return option
- **Force Return Checkbox**: State for forcing return of active items

```typescript
const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
} | null>(null);

const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean;
    user: User | null;
}>({ open: false, user: null });

const [forceReturn, setForceReturn] = useState(false);
```

### 3. Status Badge Logic
**Updated the status display priority:**

```typescript
{user.deleted_at ? (
    <Badge variant="destructive">Deleted</Badge>
) : !user.is_active ? (
    <Badge variant="secondary">Inactive</Badge>
) : user.email_verified_at ? (
    <Badge variant="default">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Active
    </Badge>
) : (
    <Badge variant="outline">Unverified</Badge>
)}
```

**Status Priority:**
1. **Deleted** (red badge) - if `deleted_at` is set
2. **Inactive** (gray badge) - if `is_active` is false
3. **Active** (blue badge with checkmark) - if email is verified and active
4. **Unverified** (outline badge) - if email not verified

### 4. Action Handlers

#### Activate/Deactivate Handler
```typescript
const handleToggleStatus = (user: User) => {
    if (user.is_active) {
        // Show confirmation dialog for deactivation
        setDeactivateDialog({ open: true, user });
    } else {
        // Activate directly
        router.post(`/users/${user.id}/activate`, {}, {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: `User "${user.name}" activated successfully.`,
                });
            },
            onError: (errors) => {
                const errorMessage = errors.error || Object.values(errors)[0];
                setNotification({
                    type: 'error',
                    message: String(errorMessage),
                });
            },
        });
    }
};
```

#### Deactivate Confirmation Handler
```typescript
const handleDeactivateConfirm = () => {
    if (!deactivateDialog.user) return;

    router.post(
        `/users/${deactivateDialog.user.id}/deactivate`,
        { force_return_items: forceReturn },
        {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: `User "${deactivateDialog.user?.name}" deactivated successfully.`,
                });
                setDeactivateDialog({ open: false, user: null });
                setForceReturn(false);
            },
            onError: (errors) => {
                const errorMessage = errors.error || Object.values(errors)[0];
                setNotification({
                    type: 'error',
                    message: String(errorMessage),
                });
                setDeactivateDialog({ open: false, user: null });
                setForceReturn(false);
            },
        }
    );
};
```

#### Delete Handler with Validation
```typescript
const handleDelete = (user: User) => {
    if (
        confirm(
            `Are you sure you want to delete "${user.name}"? This action can be undone from the trash.`
        )
    ) {
        router.delete(`/users/${user.id}`, {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: `User "${user.name}" deleted successfully.`,
                });
            },
            onError: (errors) => {
                const errorMessage = errors.error || Object.values(errors)[0];
                setNotification({
                    type: 'error',
                    message: String(errorMessage),
                });
            },
        });
    }
};
```

### 5. Dropdown Menu Actions
**Added conditional activate/deactivate buttons:**

```typescript
{!user.deleted_at && (
    <>
        {user.is_active ? (
            <DropdownMenuItem
                onClick={() => handleToggleStatus(user)}
            >
                <XCircle className="mr-2 h-4 w-4" />
                Deactivate user
            </DropdownMenuItem>
        ) : (
            <DropdownMenuItem
                onClick={() => handleToggleStatus(user)}
            >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Activate user
            </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
    </>
)}
```

**Menu Structure:**
- View details
- Edit user
- Manage roles & permissions
- **[Separator]**
- **Deactivate user** (if active) OR **Activate user** (if inactive) ✨ NEW
- **[Separator]**
- Delete user

### 6. Notification Alert
**Added alert component for feedback:**

```typescript
{notification && (
    <Alert
        variant={
            notification.type === 'error'
                ? 'destructive'
                : 'default'
        }
    >
        <AlertDescription>
            {notification.message}
        </AlertDescription>
    </Alert>
)}
```

- Auto-dismisses after 5 seconds
- Shows success (blue) or error (red) styling
- Displays server error messages or success confirmations

### 7. Deactivate Confirmation Dialog
**Added AlertDialog for deactivation confirmation:**

```typescript
<AlertDialog
    open={deactivateDialog.open}
    onOpenChange={(open) =>
        setDeactivateDialog({ ...deactivateDialog, open })
    }
>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>
                Deactivate User
            </AlertDialogTitle>
            <AlertDialogDescription>
                Are you sure you want to deactivate "
                {deactivateDialog.user?.name}"?
                {deactivateDialog.user && (
                    <div className="mt-4 space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={forceReturn}
                                onChange={(e) =>
                                    setForceReturn(
                                        e.target.checked
                                    )
                                }
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm">
                                Force return all active item
                                assignments
                            </span>
                        </label>
                        <p className="text-xs text-muted-foreground">
                            If unchecked and the user has active
                            assignments, the deactivation will
                            fail.
                        </p>
                    </div>
                )}
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel
                onClick={() => {
                    setDeactivateDialog({
                        open: false,
                        user: null,
                    });
                    setForceReturn(false);
                }}
            >
                Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm}>
                Deactivate
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

**Features:**
- Displays user name in confirmation message
- Checkbox for "Force return all active item assignments"
- Helper text explaining consequences
- Cancel and Deactivate buttons
- Resets state on cancel

### 8. New Icon Imports
Added lucide-react icons:
```typescript
import { 
    MoreHorizontal, 
    UserPlus, 
    Trash2, 
    CheckCircle2,  // ✨ NEW - for Active status and Activate action
    XCircle        // ✨ NEW - for Deactivate action
} from 'lucide-react';
```

### 9. New Component Imports
Added ShadCN UI components:
```typescript
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Alert, AlertDescription } from '@/components/ui/alert';
```

## User Experience Flow

### Activating a User
1. User clicks "Activate user" from dropdown menu
2. POST request sent to `/users/{id}/activate`
3. Success notification shows: "User '[name]' activated successfully."
4. User list refreshes showing updated status badge

### Deactivating a User
1. User clicks "Deactivate user" from dropdown menu
2. Confirmation dialog appears with:
   - User name in message
   - Checkbox: "Force return all active item assignments"
   - Helper text explaining the option
3. User can either:
   - **Cancel**: Close dialog without changes
   - **Deactivate**: Proceed with deactivation
4. If "Force return" is checked:
   - All active item assignments are automatically returned
   - User is deactivated
   - Success notification shows
5. If "Force return" is NOT checked:
   - Backend validates user has no active assignments
   - If validation passes: User is deactivated
   - If validation fails: Error message shows: "Cannot deactivate user with X active assignments"

### Deleting a User
1. User clicks "Delete user" from dropdown menu
2. Browser confirmation dialog appears
3. Backend validates:
   - User must not be active (`is_active` must be false)
   - User must not have active assignments
4. If validation passes:
   - User is soft deleted
   - Success notification shows
5. If validation fails:
   - Error message shows with reason

## Backend Routes Used

```php
// In routes/web.php
Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
Route::post('users/{user}/deactivate', [UserController::class, 'deactivate']);
Route::post('users/{user}/activate', [UserController::class, 'activate']);
Route::delete('users/{user}', [UserController::class, 'destroy']);
```

## Data Flow

```
Frontend (index.tsx)
    ↓
    POST /users/{id}/activate
    POST /users/{id}/deactivate (with force_return_items: boolean)
    DELETE /users/{id}
    ↓
Backend (UserController)
    ↓
UserService
    → activate()
    → deactivate($forceReturnItems)
    → delete($force = false)
    ↓
User Model
    → is_active field
    → activated_at timestamp
    → deactivated_at timestamp
```

## Visual Changes

### Status Badge Variants
- **Deleted**: Red destructive badge
- **Inactive**: Gray secondary badge
- **Active**: Blue default badge with green checkmark icon
- **Unverified**: Outline badge

### Action Icons
- **Activate**: Green CheckCircle2 icon
- **Deactivate**: Red XCircle icon
- **Delete**: Red Trash2 icon

## Testing Checklist

- [ ] Status badges display correctly for all states
- [ ] Activate button appears only for inactive users
- [ ] Deactivate button appears only for active users
- [ ] Neither button appears for deleted users
- [ ] Deactivate dialog opens when clicking "Deactivate user"
- [ ] Force return checkbox works correctly
- [ ] Cancel button closes dialog without changes
- [ ] Activate action works and shows success notification
- [ ] Deactivate action works with force return checked
- [ ] Deactivate action shows error if user has active assignments (force return unchecked)
- [ ] Delete action validates user is inactive first
- [ ] Notifications auto-dismiss after 5 seconds
- [ ] User list refreshes after successful actions
- [ ] Error messages display correctly from backend

## Next Steps (Optional)

1. **Update show.tsx**: Add status display to user detail page
2. **Update edit.tsx**: Add status management to edit form
3. **Update trash.tsx**: Show inactive status in deleted users list
4. **Add filters**: Filter users by Active/Inactive status
5. **Add bulk actions**: Bulk activate/deactivate selected users
6. **Email notifications**: Send email when user is activated/deactivated

## Files Modified

- ✅ `resources/js/pages/users/index.tsx` - Main users listing page

## Files NOT Modified (May need updates)
- `resources/js/pages/users/show.tsx` - User detail view
- `resources/js/pages/users/edit.tsx` - User edit form
- `resources/js/pages/users/trash.tsx` - Deleted users listing

---
**Date:** 2025-12-05
**Updated by:** GitHub Copilot
**Related Documentation:** USER_LIFECYCLE_VALIDATION.md, REFACTORING_SUMMARY.md
