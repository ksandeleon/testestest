# Request/Approval Workflow - Quick Reference

## 🚀 Quick Start Guide

### Create a Request
```php
use App\Services\RequestService;

$service = app(RequestService::class);

$request = $service->createRequest([
    'type' => 'assignment',  // assignment, purchase, disposal, maintenance, transfer, other
    'item_id' => 1,          // Optional: related item
    'title' => 'Request Title',
    'description' => 'Detailed description',
    'priority' => 'high',    // low, medium, high, urgent
]);
```

### Workflow Actions

```php
// Submit for review
$service->submitForReview($request);

// Approve (as manager)
$service->approveRequest($request, $reviewer, [
    'review_notes' => 'Looks good!',
    'auto_execute' => true,  // Auto-create assignment
    'due_date' => '2025-12-31'
]);

// Reject
$service->rejectRequest($request, $reviewer, [
    'review_notes' => 'Need more details'  // Required
]);

// Request changes
$service->requestChanges($request, $reviewer, [
    'review_notes' => 'Please add cost estimate'  // Required
]);

// Resubmit (after changes requested)
$service->resubmitRequest($request);

// Execute approved request
$service->executeRequest($request);

// Cancel
$service->cancelRequest($request, 'No longer needed');

// Add comment
$service->addComment($request, $user, 'This is a comment', $isInternal = false);
```

### Query Requests

```php
// Get with filters
$requests = $service->getRequests([
    'status' => 'pending',
    'type' => 'assignment',
    'priority' => 'high',
    'user_id' => 1,
    'search' => 'laptop'
])->paginate(20);

// Get user's requests
$myRequests = $service->getUserRequests(auth()->id());

// Get pending approvals
$pending = $service->getPendingRequests();

// Get high priority
$urgent = $service->getHighPriorityRequests();

// Get statistics
$stats = $service->getRequestStatistics();
```

## 🔄 State Transitions

```
Pending → Under Review → Approved → Completed
            ↓             ↓
        Rejected    Changes Requested
                          ↓
                      Pending (resubmit)

Any non-terminal state → Cancelled
```

## 🎯 API Endpoints

| Method | URL | Action |
|--------|-----|--------|
| GET | /requests | List all requests |
| GET | /requests/my-requests | My requests |
| GET | /requests/pending-approvals | Pending approvals |
| GET | /requests/create | Create form |
| POST | /requests | Store request |
| GET | /requests/{id} | View request |
| GET | /requests/{id}/edit | Edit form |
| PUT | /requests/{id} | Update request |
| DELETE | /requests/{id} | Delete request |
| POST | /requests/{id}/submit | Submit for review |
| GET | /requests/{id}/review | Review form |
| POST | /requests/{id}/approve | Approve |
| POST | /requests/{id}/reject | Reject |
| POST | /requests/{id}/request-changes | Request changes |
| POST | /requests/{id}/resubmit | Resubmit |
| POST | /requests/{id}/execute | Execute |
| POST | /requests/{id}/cancel | Cancel |
| POST | /requests/{id}/comments | Add comment |

## 🔐 Permissions

| Permission | Description |
|-----------|-------------|
| requests.view_any | View all requests |
| requests.view | View own requests |
| requests.create | Create requests |
| requests.update | Update own requests |
| requests.delete | Delete requests |
| requests.approve | Approve requests |
| requests.reject | Reject requests |

## 📊 Model Constants

### Request Types
```php
Request::TYPE_ASSIGNMENT      // 'assignment'
Request::TYPE_PURCHASE        // 'purchase'
Request::TYPE_DISPOSAL        // 'disposal'
Request::TYPE_MAINTENANCE     // 'maintenance'
Request::TYPE_TRANSFER        // 'transfer'
Request::TYPE_OTHER           // 'other'
```

### Request Statuses
```php
Request::STATUS_PENDING              // 'pending'
Request::STATUS_UNDER_REVIEW         // 'under_review'
Request::STATUS_APPROVED             // 'approved'
Request::STATUS_REJECTED             // 'rejected'
Request::STATUS_CHANGES_REQUESTED    // 'changes_requested'
Request::STATUS_COMPLETED            // 'completed'
Request::STATUS_CANCELLED            // 'cancelled'
```

### Priority Levels
```php
Request::PRIORITY_LOW       // 'low'
Request::PRIORITY_MEDIUM    // 'medium'
Request::PRIORITY_HIGH      // 'high'
Request::PRIORITY_URGENT    // 'urgent'
```

## 🔍 Query Scopes

```php
Request::pending()->get();
Request::underReview()->get();
Request::approved()->get();
Request::rejected()->get();
Request::completed()->get();
Request::forUser(1)->get();
Request::ofType('assignment')->get();
Request::priority('high')->get();
Request::highPriority()->get();
Request::status('pending')->get();
```

## ✅ State Check Methods

```php
$request->isPending();
$request->isUnderReview();
$request->isApproved();
$request->isRejected();
$request->isCompleted();
$request->isCancelled();
$request->hasChangesRequested();
$request->canBeEdited();
$request->canBeReviewed();
$request->canBeCancelled();
```

## 🎨 UI Helpers

```php
$request->status_color;    // 'yellow', 'blue', 'green', 'red', etc.
$request->priority_color;  // 'gray', 'blue', 'orange', 'red'
```

## 📝 Testing

```bash
# Run migrations
php artisan migrate

# Seed permissions
php artisan db:seed --class=RolePermissionSeeder

# Test in Tinker
php artisan tinker
$service = app(App\Services\RequestService::class);
$request = $service->createRequest([...]);

# Check routes
php artisan route:list --name=requests
```

## 🏗️ Architecture

```
Controller (RequestController)
    ↓ uses
Service (RequestService)
    ↓ uses
State Machine (RequestStateMachine)
    ↓ validates
Model (Request)
    ↓ stores in
Database (requests table)
```

## 📦 Files Structure

```
app/
  ├── Models/
  │   ├── Request.php
  │   └── RequestComment.php
  ├── Services/
  │   ├── RequestService.php
  │   └── RequestStateMachine.php
  ├── Http/
  │   ├── Controllers/
  │   │   └── RequestController.php
  │   └── Requests/
  │       ├── StoreRequestRequest.php
  │       ├── UpdateRequestRequest.php
  │       └── ReviewRequestRequest.php
  └── Exceptions/
      └── RequestException.php

database/migrations/
  ├── 2025_12_11_054259_create_requests_table.php
  └── 2025_12_11_054337_create_request_comments_table.php
```

---

**Status:** ✅ Backend Complete & Functional  
**Next:** Build React frontend UI
