<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    /**
     * Create a new user with optional invitation.
     *
     * @param array $data
     * @param bool $sendInvitation
     * @return User
     */
    public function create(array $data, bool $sendInvitation = false): User
    {
        return DB::transaction(function () use ($data, $sendInvitation) {
            // Create user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => isset($data['password'])
                    ? Hash::make($data['password'])
                    : Hash::make(Str::random(32)), // Temp password if invitation
                'is_active' => !$sendInvitation, // Active immediately if no invitation
            ]);

            // Set activated_at if active immediately
            if (!$sendInvitation) {
                $user->update(['activated_at' => now()]);
            }

            // Assign role if provided
            if (isset($data['role'])) {
                $user->assignRole($data['role']);
            }

            // TODO: Send invitation email if requested
            // if ($sendInvitation) {
            //     Mail::to($user)->send(new UserInvitation($user, $invitationToken));
            // }

            activity()
                ->performedOn($user)
                ->log('User created' . ($sendInvitation ? ' and invitation sent' : ''));

            return $user;
        });
    }

    /**
     * Activate a user account.
     *
     * @param User $user
     * @return User
     */
    public function activate(User $user): User
    {
        $user->update([
            'is_active' => true,
            'activated_at' => now(),
            'deactivated_at' => null,
        ]);

        activity()
            ->performedOn($user)
            ->log('User account activated');

        return $user;
    }

    /**
     * Deactivate a user account.
     * Checks for active assignments and optionally forces returns.
     *
     * @param User $user
     * @param bool $forceReturnItems
     * @return User
     * @throws \Exception
     */
    public function deactivate(User $user, bool $forceReturnItems = false): User
    {
        return DB::transaction(function () use ($user, $forceReturnItems) {
            // Check for active assignments
            $activeAssignmentsCount = $user->activeAssignments()->count();

            if ($activeAssignmentsCount > 0) {
                if (!$forceReturnItems) {
                    throw new \Exception(
                        "Cannot deactivate user '{$user->name}' because they have {$activeAssignmentsCount} active item assignment(s). " .
                        "Please return all items first or use the force return option."
                    );
                }

                // Force return all items
                $returnedCount = $this->forceReturnAllItems($user);

                activity()
                    ->performedOn($user)
                    ->withProperties(['items_returned' => $returnedCount])
                    ->log("Force returned {$returnedCount} items before deactivation");
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
     *
     * @param User $user
     * @return int Number of items returned
     */
    public function forceReturnAllItems(User $user): int
    {
        $activeAssignments = $user->activeAssignments;
        $count = 0;

        foreach ($activeAssignments as $assignment) {
            // Update assignment status to returned
            $assignment->update(['status' => Assignment::STATUS_RETURNED]);

            // Item status will be auto-updated by AssignmentObserver
            // to 'available' when assignment is marked as returned

            activity()
                ->performedOn($assignment)
                ->withProperties([
                    'reason' => 'User deactivated - forced return',
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                ])
                ->log('Assignment force returned due to user deactivation');

            $count++;
        }

        return $count;
    }

    /**
     * Toggle user active status.
     *
     * @param User $user
     * @param bool $forceReturnItems
     * @return User
     * @throws \Exception
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
     * Update user information.
     *
     * @param User $user
     * @param array $data
     * @return User
     */
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $updateData = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            // Only update password if provided
            if (isset($data['password']) && !empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            $user->update($updateData);

            activity()
                ->performedOn($user)
                ->log('User information updated');

            return $user;
        });
    }

    /**
     * Soft delete user with validation.
     *
     * @param User $user
     * @param bool $force
     * @return bool
     * @throws \Exception
     */
    public function delete(User $user, bool $force = false): bool
    {
        return DB::transaction(function () use ($user, $force) {
            // Check if user is active
            if ($user->is_active && !$force) {
                throw new \Exception(
                    "Cannot delete active user '{$user->name}'. Please deactivate the user first."
                );
            }

            // Check for active assignments
            if ($user->hasActiveAssignments()) {
                throw new \Exception(
                    "Cannot delete user '{$user->name}' because they have active item assignments. " .
                    "All items must be returned before deletion."
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
     *
     * @param User $user
     * @return bool
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
