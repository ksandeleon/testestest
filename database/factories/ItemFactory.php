<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brands = ['Acer', 'Dell', 'HP', 'Lenovo', 'Asus', 'Samsung', 'Canon', 'Epson'];
        $conditions = ['excellent', 'good', 'fair'];
        $statuses = ['available', 'assigned', 'in_use'];

        return [
            'iar_number' => 'IAR-' . fake()->unique()->numerify('###-####-###'),
            'property_number' => fake()->unique()->numerify('####-##-###-###'),
            'fund_cluster' => 'FUND ' . fake()->numberBetween(100, 999),
            'name' => fake()->randomElement(['Desktop Computer', 'Laptop', 'Printer', 'Scanner', 'Projector', 'Monitor']),
            'description' => fake()->sentence(10),
            'brand' => fake()->randomElement($brands),
            'model' => strtoupper(fake()->bothify('??###?')),
            'serial_number' => strtoupper(fake()->bothify('??###??###??###??')),
            'specifications' => fake()->sentence(6),
            'acquisition_cost' => fake()->randomFloat(2, 5000, 100000),
            'unit_of_measure' => 'unit',
            'quantity' => 1,
            'date_acquired' => fake()->dateTimeBetween('-5 years', 'now'),
            'date_inventoried' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
            'estimated_useful_life' => fake()->optional()->dateTimeBetween('now', '+10 years'),
            'status' => fake()->randomElement($statuses),
            'condition' => fake()->randomElement($conditions),
            'remarks' => fake()->optional()->sentence(),
        ];
    }
}
