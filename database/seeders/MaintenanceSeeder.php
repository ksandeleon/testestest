<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Maintenance;
use App\Models\User;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = Item::all();
        $users = User::all();

        if ($items->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Please seed items and users first!');
            return;
        }

        $maintenanceRecords = [
            // Completed maintenance
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'preventive',
                'status' => 'completed',
                'priority' => 'medium',
                'title' => 'Regular System Maintenance',
                'description' => 'Routine cleaning and software updates for desktop computer',
                'issue_reported' => 'Scheduled preventive maintenance',
                'action_taken' => 'Cleaned hardware components, updated OS and drivers, checked for viruses',
                'recommendations' => 'Continue regular monthly maintenance',
                'estimated_cost' => 500.00,
                'actual_cost' => 450.00,
                'cost_approved' => true,
                'scheduled_date' => now()->subDays(10),
                'started_at' => now()->subDays(10)->addHours(1),
                'completed_at' => now()->subDays(10)->addHours(3),
                'estimated_duration' => 120,
                'actual_duration' => 120,
                'item_condition_before' => 'good',
                'item_condition_after' => 'good',
                'item_status_before' => 'assigned',
                'item_status_after' => 'assigned',
                'assigned_to' => $users->random()->id,
                'requested_by' => $users->random()->id,
                'approved_by' => $users->first()->id,
                'created_by' => $users->first()->id,
            ],
            // In progress - High priority
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'corrective',
                'status' => 'in_progress',
                'priority' => 'high',
                'title' => 'Printer Paper Jam Issue',
                'description' => 'Persistent paper jam error, needs thorough inspection',
                'issue_reported' => 'Paper jams every 10-15 prints, error code E03',
                'estimated_cost' => 1500.00,
                'cost_approved' => true,
                'scheduled_date' => now()->subDays(1),
                'started_at' => now()->subHours(2),
                'estimated_duration' => 180,
                'item_condition_before' => 'fair',
                'item_status_before' => 'in_use',
                'assigned_to' => $users->random()->id,
                'requested_by' => $users->random()->id,
                'approved_by' => $users->first()->id,
                'created_by' => $users->random()->id,
            ],
            // Scheduled - Critical priority
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'emergency',
                'status' => 'scheduled',
                'priority' => 'critical',
                'title' => 'Air Conditioning Unit Not Cooling',
                'description' => 'AC unit running but not producing cold air, possible refrigerant leak',
                'issue_reported' => 'Room temperature rising, AC compressor running but no cooling',
                'estimated_cost' => 5000.00,
                'scheduled_date' => now()->addHours(4),
                'estimated_duration' => 240,
                'assigned_to' => $users->random()->id,
                'requested_by' => $users->random()->id,
                'created_by' => $users->random()->id,
                'notes' => 'Priority: URGENT - Server room temperature critical',
            ],
            // Pending - awaiting schedule
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'corrective',
                'status' => 'pending',
                'priority' => 'medium',
                'title' => 'Monitor Display Flickering',
                'description' => 'Intermittent screen flickering on right monitor',
                'issue_reported' => 'Screen flickers randomly, especially when displaying white backgrounds',
                'estimated_cost' => 800.00,
                'requested_by' => $users->random()->id,
                'created_by' => $users->random()->id,
            ],
            // Scheduled preventive - Low priority
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'preventive',
                'status' => 'scheduled',
                'priority' => 'low',
                'title' => 'Quarterly Network Equipment Check',
                'description' => 'Routine inspection of network switches and cables',
                'issue_reported' => 'Scheduled quarterly maintenance',
                'estimated_cost' => 300.00,
                'scheduled_date' => now()->addDays(7),
                'estimated_duration' => 60,
                'assigned_to' => $users->random()->id,
                'requested_by' => $users->random()->id,
                'created_by' => $users->first()->id,
            ],
            // Completed - with cost overrun
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'corrective',
                'status' => 'completed',
                'priority' => 'high',
                'title' => 'Hard Drive Replacement',
                'description' => 'Replace failing hard drive showing SMART errors',
                'issue_reported' => 'Frequent disk errors, slow performance, SMART warnings',
                'action_taken' => 'Replaced 1TB HDD with 1TB SSD, migrated data, verified integrity',
                'recommendations' => 'Monitor system performance for 1 week, schedule data backup',
                'estimated_cost' => 3000.00,
                'actual_cost' => 3500.00,
                'cost_approved' => true,
                'cost_breakdown' => '1TB SSD: ₱2,800, Labor: ₱500, Data migration: ₱200',
                'scheduled_date' => now()->subDays(5),
                'started_at' => now()->subDays(5)->addHours(2),
                'completed_at' => now()->subDays(5)->addHours(5),
                'estimated_duration' => 180,
                'actual_duration' => 180,
                'item_condition_before' => 'fair',
                'item_condition_after' => 'good',
                'item_status_before' => 'in_use',
                'item_status_after' => 'assigned',
                'assigned_to' => $users->random()->id,
                'requested_by' => $users->random()->id,
                'approved_by' => $users->first()->id,
                'created_by' => $users->random()->id,
            ],
            // Overdue maintenance
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'corrective',
                'status' => 'scheduled',
                'priority' => 'high',
                'title' => 'Laptop Battery Replacement',
                'description' => 'Battery not holding charge, needs replacement',
                'issue_reported' => 'Battery drains in 30 minutes, swelling detected',
                'estimated_cost' => 2500.00,
                'cost_approved' => false,
                'scheduled_date' => now()->subDays(2), // Overdue!
                'estimated_duration' => 30,
                'assigned_to' => $users->random()->id,
                'requested_by' => $users->random()->id,
                'created_by' => $users->random()->id,
                'notes' => 'Waiting for budget approval',
            ],
            // Pending - Not yet approved
            [
                'item_id' => $items->random()->id,
                'maintenance_type' => 'predictive',
                'status' => 'pending',
                'priority' => 'low',
                'title' => 'Projector Bulb Preventive Replacement',
                'description' => 'Projector bulb approaching end of life (2800/3000 hours)',
                'issue_reported' => 'Proactive replacement before failure',
                'estimated_cost' => 4500.00,
                'requested_by' => $users->random()->id,
                'created_by' => $users->random()->id,
                'notes' => 'Bulb at 93% of rated life, recommend replacement within 2 weeks',
            ],
        ];

        foreach ($maintenanceRecords as $record) {
            Maintenance::create($record);
        }

        // Create some additional random maintenance records
        for ($i = 0; $i < 15; $i++) {
            $item = $items->random();
            $requestedBy = $users->random();
            $assignedTo = $users->random();

            $type = fake()->randomElement(['preventive', 'corrective', 'predictive', 'emergency']);
            $status = fake()->randomElement(['pending', 'scheduled', 'in_progress', 'completed']);
            $priority = fake()->randomElement(['low', 'medium', 'high', 'critical']);

            $scheduledDate = fake()->dateTimeBetween('-30 days', '+30 days');
            $startedAt = $status === 'in_progress' || $status === 'completed' ? (clone $scheduledDate)->modify('+1 hour') : null;
            $completedAt = $status === 'completed' ? (clone $startedAt)->modify('+' . rand(1, 4) . ' hours') : null;

            Maintenance::create([
                'item_id' => $item->id,
                'maintenance_type' => $type,
                'status' => $status,
                'priority' => $priority,
                'title' => fake()->sentence(4),
                'description' => fake()->sentence(12),
                'issue_reported' => fake()->optional()->sentence(8),
                'action_taken' => $status === 'completed' ? fake()->sentence(10) : null,
                'recommendations' => $status === 'completed' ? fake()->optional()->sentence(8) : null,
                'estimated_cost' => fake()->optional()->randomFloat(2, 200, 5000),
                'actual_cost' => $status === 'completed' ? fake()->randomFloat(2, 200, 5000) : null,
                'cost_approved' => $status !== 'pending' ? fake()->boolean(80) : false,
                'scheduled_date' => $scheduledDate,
                'started_at' => $startedAt,
                'completed_at' => $completedAt,
                'estimated_duration' => rand(30, 300),
                'actual_duration' => $completedAt ? rand(30, 300) : null,
                'item_condition_before' => fake()->randomElement(['excellent', 'good', 'fair']),
                'item_condition_after' => $status === 'completed' ? fake()->randomElement(['excellent', 'good', 'fair']) : null,
                'item_status_before' => $item->status,
                'item_status_after' => $status === 'completed' ? fake()->randomElement(['available', 'assigned', 'in_use']) : null,
                'assigned_to' => $status !== 'pending' ? $assignedTo->id : null,
                'requested_by' => $requestedBy->id,
                'approved_by' => $status !== 'pending' && fake()->boolean(70) ? $users->first()->id : null,
                'created_by' => $requestedBy->id,
                'notes' => fake()->optional()->sentence(6),
            ]);
        }

        $this->command->info('Created ' . (count($maintenanceRecords) + 15) . ' maintenance records.');
    }
}
