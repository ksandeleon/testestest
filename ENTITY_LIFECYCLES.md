# Entity Lifecycles

=## 1. Item Lifecycle
```
Create → Active → [Assignment/Maintenance/Disposal]
  ↓
Active ← Return (if assigned)
  ↓
Maintenance → Under Maintenance -> Repaired → Active
  ↓
Damaged → [Repair or Disposal]
  ↓
Disposal → Pending Approval → Approved → Disposed
  ↓
Deleted (Soft) → [Restore or Soft Delete]
```

**States:**
- `active` - Available for assignment
- `assigned` - Currently with a user
- `under_maintenance` - Being repaired
- `damaged` - Requires attention
- `pending_disposal` - Marked for disposal
- `disposed` - No longer in inventory
- `deleted` - Soft deleted

---

=## 2. Assignment Lifecycle
```
Request (optional) → Create → Assigned → Active
  ↓
[Overdue if not returned by due date]
  ↓
Return Initiated → Pending Inspection → Inspected → Completed
  ↓
[Branch: Approved or Rejected]
  ↓
Approved → Item Available
  ↓
Rejected → Item Remains with User → Re-inspect or Extend
```

**States:**
- `pending` - Request awaiting approval (if approval workflow enabled)
- `approved` - Request approved
- `rejected` - Request rejected
- `active` - Currently assigned to user
- `overdue` - Past due date
- `returned` - User has returned item
- `completed` - Assignment closed successfully
- `cancelled` - Assignment cancelled

---

=## 3. Return Lifecycle
```
Process Return → Pending Inspection → Assign Inspector
  ↓
Inspect → Check Condition → [Record Damage if any]
  ↓
[Branch: Approve or Reject]
  ↓
Approve → Item Available → Assignment Completed
  ↓
Reject → Pending Re-inspection or User Action
  ↓
[If Damaged] → Log Damage → [Repair or Charge User]
  ↓
[If Late] → Calculate Penalty → Record
```

**States:**
- `pending_inspection` - Awaiting inspection
- `approved` - Return accepted, item available
- `rejected` - Return rejected, needs user action

**Flags:**
- `is_damaged` - Item has damage
- `is_late` - Returned past due date
- `penalty_amount` - Late fee calculated

---

=## 4. Maintenance Lifecycle
```
Request → Scheduled → Assign Technician
  ↓
In Progress → [Update Status] → [Log Costs]
  ↓
Completed → Verify → [Update Item Condition]
  ↓
Item → [Available or Needs More Work]
  ↓
[Branch: Repairable or Disposal]
  ↓
Disposal → Mark for Disposal → Disposal Lifecycle
```

**States:**
- `scheduled` - Maintenance planned
- `in_progress` - Currently being worked on
- `completed` - Work finished
- `cancelled` - Maintenance cancelled

---

=## 5. Disposal Lifecycle
```
Mark for Disposal → Create Request → Add Reason
  ↓
Pending Approval → Assign Approver → Review
  ↓
[Branch: Approve or Reject]
  ↓
Approve → Schedule Execution → Document
  ↓
Execute Disposal → Final Documentation → Item Disposed
  ↓
Reject → Return to Active (if repairable) or Re-evaluate
```

**States:**
- `pending` - Awaiting approval
- `approved` - Approved for disposal
- `rejected` - Disposal request rejected
- `executed` - Disposal completed

---

## 6. Request/Approval Workflow Lifecycle
```
User Creates Request → Submit
  ↓
Pending Review → Notify Approver
  ↓
Review → [Add Comments/Questions]
  ↓
[Branch: Approve, Reject, or Request Changes]
  ↓
Approve -> Execute Action (Assignment/Purchase/etc.) → Notify User
  ↓
Reject/Request Change → Notify User → [User Can Resubmit]
  ↓
Request Changes → Notify User -> User Updates → Re-submit
```

**States:**
- `pending` - Awaiting review
- `under_review` - Being reviewed
- `approved` - Request approved
- `rejected` - Request denied
- `changes_requested` - Needs modification
- `completed` - Action taken

---

=## 7. Category/Location Lifecycle
```
Create → Active → [Items Associated]
  ↓
Update → Modify Details
  ↓
Delete → Check Dependencies
  ↓
[If has items] → Prevent Delete or Reassign Items
  ↓
[If no items] → Soft Delete → [Restore or Force Delete]
```

**States:**
- `active` - In use
- `deleted` - Soft deleted

---

## 8. User Lifecycle
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

**States:**
- `active` - Can login and use system
- `inactive` - Account disabled
- `deleted` - Soft deleted

---

## 9. Notification Lifecycle
```
Event Triggered → Create Notification
  ↓
Queue → Send to User(s)
  ↓
Delivered → Mark as Sent
  ↓
User Views → Mark as Read
  ↓
[After retention period] → Archive or Delete
```

**States:**
- `unread` - Not yet viewed
- `read` - User has viewed
- `archived` - Moved to archive

---

## 10. Activity Log Lifecycle
```
Action Performed → Log Created
  ↓
Store → [User, Action, Entity, Changes, Timestamp]
  ↓
[Queryable for reports and audit]
  ↓
[After retention period] → Archive
  ↓
[After archive period] → Purge (if policy allows)
```

**States:**
- `active` - Current logs
- `archived` - Old logs

---

## 11. Report Lifecycle
```
Generate Request → Configure Parameters
  ↓
Process → Query Data → Format
  ↓
Generated → [View or Export]
  ↓
Export → [Excel, PDF, CSV]
  ↓
[Optional] Schedule → Auto-generate → Email
```

**Types:**
- `user_assignments` - Who has what
- `item_history` - Item movement history
- `inventory_summary` - Stock overview
- `financial` - Costs and values
- `disposal` - Disposal records
- `maintenance` - Maintenance history
- `utilization` - Usage statistics

---

## 12. QR Code Lifecycle
```
Item Created → Generate QR → Store Code
  ↓
Print → Physical Label Created
  ↓
[Scan Events] → Track Usage
  ↓
Assignment Scan → Log Assignment
  ↓
Return Scan → Verify Item → Log Return
  ↓
Maintenance Scan → Log Maintenance Start/End
  ↓
Regenerate → Update Code → Reprint
```

**Events:**
- `view` - Item details viewed via QR
- `assign` - Assignment via QR scan
- `return` - Return via QR scan
- `maintenance` - Maintenance logged via QR
- `audit` - Physical audit scan

---

## Key Integration Points

### Item ↔ Assignment ↔ Return
- Item assigned → Status: `assigned`
- Return initiated → Status: `pending_inspection`
- Return approved → Status: `active`

### Item ↔ Maintenance
- Maintenance scheduled → Status: `under_maintenance`
- Maintenance completed → Status: `active` (or `damaged`)

### Item ↔ Disposal
- Marked for disposal → Status: `pending_disposal`
- Disposal executed → Status: `disposed`

### Assignment ↔ User
- User deactivated → Auto-process all returns
- User deleted → Must return all items first

### Request → Action
- Approved assignment request → Create assignment
- Approved item request → Trigger purchase/acquisition
- Approved disposal → Execute disposal

---

## Permission-based Workflow Examples

### Staff User Flow:
```
View My Items → Request Return → Wait Approval → Return Processed
```

### Assignment Officer Flow:
```
Create Assignment → User Accepts → Monitor → Process Return → Inspect → Approve
```

### Maintenance Coordinator Flow:
```
Receive Request → Schedule → Assign Technician → Monitor → Mark Complete → Update Item
```

### Auditor Flow:
```
View All Records → Generate Reports → Export → Review Activity Logs
```

### Property Administrator Flow:
```
Manage All Entities → Approve Requests → Generate Reports → Configure System
```




====installed libraries:

baconqr? for qr? unsure yet..

spatie/laravel-permission - Role & permission management
spatie/laravel-activitylog - Activity logging

# Excel Import/Export (items.import, items.export, reports.export)
composer require maatwebsite/excel

# PDF Generation (for reports, QR labels)
composer require barryvdh/laravel-dompdf

# Job Queue (for async tasks like bulk QR generation)
composer require predis/predis  # If using Redis
# OR already have database queue driver


