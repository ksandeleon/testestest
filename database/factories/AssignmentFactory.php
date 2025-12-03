<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssignmentFactory extends Factory
{
    protected $model = Assignment::class;

    public function definition(): array
    {
        $assignedDate = $this->faker->dateTimeBetween('-6 months', 'now');
        $dueDate = $this->faker->optional(0.7)->dateTimeBetween($assignedDate, '+3 months');

        return [
            'item_id' => Item::factory(),
            'user_id' => User::factory(),
            'assigned_by' => User::factory(),
            'status' => $this->faker->randomElement(Assignment::STATUSES),
            'assigned_date' => $assignedDate,
            'due_date' => $dueDate,
            'returned_date' => null,
            'purpose' => $this->faker->optional(0.8)->sentence(),
            'notes' => $this->faker->optional(0.5)->paragraph(),
            'admin_notes' => $this->faker->optional(0.3)->sentence(),
            'condition_on_assignment' => $this->faker->randomElement([
                Assignment::CONDITION_GOOD,
                Assignment::CONDITION_FAIR,
                Assignment::CONDITION_POOR,
            ]),
        ];
    }

    /**
     * Indicate that the assignment is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Assignment::STATUS_ACTIVE,
            'returned_date' => null,
        ]);
    }

    /**
     * Indicate that the assignment is returned.
     */
    public function returned(): static
    {
        return $this->state(function (array $attributes) {
            $returnedDate = $this->faker->dateTimeBetween($attributes['assigned_date'], 'now');

            return [
                'status' => Assignment::STATUS_RETURNED,
                'returned_date' => $returnedDate,
            ];
        });
    }

    /**
     * Indicate that the assignment is overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Assignment::STATUS_ACTIVE,
            'due_date' => $this->faker->dateTimeBetween('-2 months', '-1 day'),
            'returned_date' => null,
        ]);
    }

    /**
     * Indicate that the assignment is pending approval.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Assignment::STATUS_PENDING,
        ]);
    }

    /**
     * Indicate that the assignment is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Assignment::STATUS_CANCELLED,
        ]);
    }
}
