<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Item;
use App\Models\ItemReturn;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users and items
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['staff', 'department_head', 'inventory_clerk']);
        })->get();

        $items = Item::where('status', 'available')
            ->orWhere('status', 'assigned')
            ->get();

        if ($users->isEmpty() || $items->isEmpty()) {
            $this->command->warn('Need users with staff roles and items to create assignments');
            return;
        }

        $assignedBy = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['superadmin', 'property_administrator', 'property_manager']);
        })->first();

        if (!$assignedBy) {
            $this->command->warn('Need an admin user to assign items');
            return;
        }

        // Create active assignments
        $this->command->info('Creating active assignments...');
        for ($i = 0; $i < 15; $i++) {
            $item = $items->random();
            $user = $users->random();

            $assignment = Assignment::create([
                'item_id' => $item->id,
                'user_id' => $user->id,
                'assigned_by' => $assignedBy->id,
                'status' => Assignment::STATUS_ACTIVE,
                'assigned_date' => now()->subDays(rand(1, 60)),
                'due_date' => now()->addDays(rand(10, 90)),
                'purpose' => fake()->randomElement([
                    'Office work',
                    'Project development',
                    'Field work',
                    'Research purposes',
                    'Administrative tasks',
                ]),
                'notes' => fake()->optional(0.6)->sentence(),
                'condition_on_assignment' => fake()->randomElement(['good', 'fair']),
            ]);

            // Update item status
            $item->update(['status' => 'assigned']);
        }

        // Create some overdue assignments
        $this->command->info('Creating overdue assignments...');
        for ($i = 0; $i < 5; $i++) {
            $item = Item::where('status', 'available')->inRandomOrder()->first();
            if (!$item) continue;

            $user = $users->random();

            $assignment = Assignment::create([
                'item_id' => $item->id,
                'user_id' => $user->id,
                'assigned_by' => $assignedBy->id,
                'status' => Assignment::STATUS_ACTIVE,
                'assigned_date' => now()->subDays(rand(90, 180)),
                'due_date' => now()->subDays(rand(1, 30)), // Overdue!
                'purpose' => fake()->sentence(),
                'condition_on_assignment' => 'good',
            ]);

            $item->update(['status' => 'assigned']);
        }

        // Create some completed (returned) assignments with returns
        $this->command->info('Creating returned assignments...');
        for ($i = 0; $i < 10; $i++) {
            $item = Item::where('status', 'available')->inRandomOrder()->first();
            if (!$item) continue;

            $user = $users->random();
            $assignedDate = now()->subDays(rand(60, 180));
            $returnDate = now()->subDays(rand(1, 30));

            $assignment = Assignment::create([
                'item_id' => $item->id,
                'user_id' => $user->id,
                'assigned_by' => $assignedBy->id,
                'status' => Assignment::STATUS_RETURNED,
                'assigned_date' => $assignedDate,
                'due_date' => $assignedDate->copy()->addDays(rand(30, 90)),
                'returned_date' => $returnDate,
                'purpose' => fake()->sentence(),
                'condition_on_assignment' => 'good',
            ]);

            // Create return record
            $isDamaged = fake()->boolean(20);
            $isLate = $returnDate->greaterThan($assignment->due_date);

            $return = ItemReturn::create([
                'assignment_id' => $assignment->id,
                'returned_by' => $user->id,
                'inspected_by' => $assignedBy->id,
                'status' => ItemReturn::STATUS_APPROVED,
                'return_date' => $returnDate,
                'inspection_date' => $returnDate->copy()->addHours(rand(1, 24)),
                'condition_on_return' => $isDamaged ? 'damaged' : fake()->randomElement(['good', 'fair']),
                'is_damaged' => $isDamaged,
                'damage_description' => $isDamaged ? fake()->paragraph() : null,
                'is_late' => $isLate,
                'days_late' => $isLate ? $assignment->due_date->diffInDays($returnDate) : 0,
                'return_notes' => fake()->optional(0.5)->sentence(),
                'inspection_notes' => 'Item inspected and ' . ($isDamaged ? 'found damaged' : 'in good condition'),
                'penalty_amount' => $isLate ? $assignment->due_date->diffInDays($returnDate) * 10 : 0,
                'penalty_paid' => $isLate ? fake()->boolean(60) : false,
            ]);

            // Update item status
            $item->update([
                'status' => $isDamaged ? 'damaged' : 'available',
                'condition' => $isDamaged ? 'poor' : 'good',
            ]);
        }

        // Create pending assignments (awaiting approval)
        $this->command->info('Creating pending assignments...');
        for ($i = 0; $i < 3; $i++) {
            $item = Item::where('status', 'available')->inRandomOrder()->first();
            if (!$item) continue;

            Assignment::create([
                'item_id' => $item->id,
                'user_id' => $users->random()->id,
                'assigned_by' => $assignedBy->id,
                'status' => Assignment::STATUS_PENDING,
                'assigned_date' => now(),
                'due_date' => now()->addDays(rand(30, 90)),
                'purpose' => fake()->sentence(),
                'condition_on_assignment' => 'good',
            ]);
        }

        $this->command->info('Assignment seeding completed successfully!');
    }
}
