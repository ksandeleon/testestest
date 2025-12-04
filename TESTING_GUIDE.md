# Quick Testing Guide

## Before Testing

### 1. Clear Application Cache
```bash
php artisan optimize:clear
```

### 2. Verify Database Schema
```bash
# Check that item status enum matches constants
php artisan db:show
```

### 3. Check for Errors
```bash
php artisan route:list | grep items
```

---

## Testing Sequence

### Phase 1: Basic CRUD (No Status Changes)

1. **Create Item** (available status)
   - Navigate to Items → Create
   - Fill all required fields
   - Submit
   - ✅ Check: Item created with QR code
   - ✅ Check: Activity log entry exists

2. **Update Item** (non-status fields)
   - Edit an existing item
   - Change name, description
   - Submit
   - ✅ Check: Changes saved
   - ✅ Check: Activity log shows update

3. **Soft Delete Item**
   - Delete an available item
   - ✅ Check: Item soft deleted
   - ✅ Check: QR code still exists

4. **Restore Item**
   - Restore the deleted item
   - ✅ Check: Item visible again

---

### Phase 2: Status Validation

1. **Valid Status Transition** (available → assigned)
   - Create assignment for an available item
   - ✅ Check: Item status becomes 'assigned'
   - ✅ Check: AssignmentObserver fired
   - ✅ Check: Activity log shows status change

2. **Invalid Status Transition** (disposed → assigned)
   - Try to update item status from 'disposed' to 'assigned'
   - ✅ Check: Error notification appears
   - ✅ Check: Error message explains allowed transitions

---

### Phase 3: Assignment Integration

1. **Create Active Assignment**
   - Assign available item to user with status='active'
   - ✅ Check: Item status → 'assigned'

2. **Return Assignment**
   - Update assignment status to 'returned'
   - ✅ Check: Item status → 'available'

3. **Cancel Assignment**
   - Create assignment then cancel
   - ✅ Check: Item status → 'available'

4. **Multiple Assignments**
   - Create 2 assignments for same item
   - Return first assignment
   - ✅ Check: Item still 'assigned' (second is active)
   - Return second assignment
   - ✅ Check: Item now 'available'

---

### Phase 4: Maintenance Integration

1. **Schedule Maintenance**
   - Create maintenance with status='scheduled'
   - ✅ Check: Item status → 'in_maintenance'

2. **Complete Maintenance (Good Condition)**
   - Update maintenance to 'completed'
   - Item condition = 'good'
   - ✅ Check: Item status → 'available'

3. **Complete Maintenance (Damaged)**
   - Create maintenance, complete it
   - Item condition = 'damaged'
   - ✅ Check: Item status → 'damaged'

4. **Cancel Maintenance**
   - Create maintenance then cancel
   - ✅ Check: Item status → 'available'

---

### Phase 5: Error Handling

1. **Delete Assigned Item**
   - Try to delete item that's currently assigned
   - ✅ Check: Error: "Cannot delete item that is currently assigned"

2. **Delete Item Under Maintenance**
   - Try to delete item in maintenance
   - ✅ Check: Error: "Cannot delete item that is currently under maintenance"

3. **QR Generation Failure**
   - Test QR regeneration
   - ✅ Check: Old QR deleted, new QR created

---

## Expected Behavior Summary

### Item Status Flow

```
CREATE → available

ASSIGNMENT:
available → assigned (when assignment active)
assigned → available (when all assignments returned/cancelled)

MAINTENANCE:
available → in_maintenance (when scheduled/in_progress)
in_maintenance → available (when completed, good condition)
in_maintenance → damaged (when completed, bad condition)

DISPOSAL:
available/damaged → for_disposal → disposed
```

### Observer Triggers

| Action | Observer | Effect |
|--------|----------|--------|
| Assignment created (active) | AssignmentObserver | Item → assigned |
| Assignment updated (returned) | AssignmentObserver | Item → available |
| Assignment cancelled | AssignmentObserver | Item → available |
| Maintenance created (scheduled) | MaintenanceObserver | Item → in_maintenance |
| Maintenance completed | MaintenanceObserver | Item → available OR damaged |
| Maintenance cancelled | MaintenanceObserver | Item → available |

---

## Common Issues & Solutions

### Issue: "Call to undefined method hasRole()"
**Cause:** User model not using Spatie's HasRoles trait  
**Fix:** Check `app/Models/User.php` has `use HasRoles;`

### Issue: QR codes not generating
**Cause:** Storage link not created  
**Fix:** `php artisan storage:link`

### Issue: Status constants mismatch error
**Cause:** Old migrations still using wrong enum values  
**Fix:** `php artisan migrate:fresh --seed` (WARNING: Deletes data!)

### Issue: Observers not firing
**Cause:** Cache not cleared  
**Fix:** `php artisan optimize:clear`

---

## Performance Checks

### Database Queries
- Each item CRUD should be 1 main query + relationships
- Status updates should use transactions (check logs)

### Activity Logs
- Every status change should create activity log entry
- Check: `SELECT * FROM activity_log WHERE subject_type = 'App\\Models\\Item' ORDER BY id DESC LIMIT 20`

---

## Rollback Plan

If critical issues found:

```bash
# Restore original controller
mv app/Http/Controllers/ItemController.php.backup app/Http/Controllers/ItemController.php

# Remove new files
rm app/Services/ItemService.php
rm app/Services/QrCodeService.php
rm app/Services/ItemStateMachine.php
rm app/Http/Requests/StoreItemRequest.php
rm app/Http/Requests/UpdateItemRequest.php
rm app/Observers/AssignmentObserver.php
rm app/Observers/MaintenanceObserver.php

# Revert AppServiceProvider
git checkout app/Providers/AppServiceProvider.php

# Revert Item model constants
git checkout app/Models/Item.php

# Clear cache
php artisan optimize:clear
```

---

## Success Criteria

✅ All CRUD operations work  
✅ Status transitions validated  
✅ Observers auto-update status  
✅ Error messages clear and helpful  
✅ Activity logs complete  
✅ QR codes generate/delete properly  
✅ Transactions rollback on failure  
✅ No N+1 query issues  

Once all tests pass, the refactoring is production-ready!
