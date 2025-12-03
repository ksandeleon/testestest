<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\ItemReturn;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemReturnFactory extends Factory
{
    protected $model = ItemReturn::class;

    public function definition(): array
    {
        return [
            'assignment_id' => Assignment::factory(),
            'returned_by' => User::factory(),
            'inspected_by' => null,
            'status' => ItemReturn::STATUS_PENDING_INSPECTION,
            'return_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'inspection_date' => null,
            'condition_on_return' => $this->faker->randomElement(ItemReturn::CONDITIONS),
            'is_damaged' => $this->faker->boolean(20), // 20% chance of damage
            'damage_description' => $this->faker->optional(0.2)->paragraph(),
            'damage_images' => null,
            'is_late' => $this->faker->boolean(15), // 15% chance of being late
            'days_late' => 0,
            'return_notes' => $this->faker->optional(0.6)->sentence(),
            'inspection_notes' => null,
            'penalty_amount' => 0,
            'penalty_paid' => false,
        ];
    }

    /**
     * Indicate that the return has been inspected.
     */
    public function inspected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ItemReturn::STATUS_INSPECTED,
            'inspected_by' => User::factory(),
            'inspection_date' => $this->faker->dateTimeBetween($attributes['return_date'], 'now'),
            'inspection_notes' => $this->faker->sentence(),
        ]);
    }

    /**
     * Indicate that the return has been approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ItemReturn::STATUS_APPROVED,
            'inspected_by' => User::factory(),
            'inspection_date' => $this->faker->dateTimeBetween($attributes['return_date'], 'now'),
        ]);
    }

    /**
     * Indicate that the return is damaged.
     */
    public function damaged(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_damaged' => true,
            'condition_on_return' => ItemReturn::CONDITION_DAMAGED,
            'damage_description' => $this->faker->paragraph(),
        ]);
    }

    /**
     * Indicate that the return is late.
     */
    public function late(): static
    {
        return $this->state(function (array $attributes) {
            $daysLate = $this->faker->numberBetween(1, 30);

            return [
                'is_late' => true,
                'days_late' => $daysLate,
                'penalty_amount' => $daysLate * 10, // $10 per day
                'penalty_paid' => $this->faker->boolean(30),
            ];
        });
    }

    /**
     * Indicate that the return is in good condition.
     */
    public function goodCondition(): static
    {
        return $this->state(fn (array $attributes) => [
            'condition_on_return' => ItemReturn::CONDITION_GOOD,
            'is_damaged' => false,
            'damage_description' => null,
        ]);
    }
}
