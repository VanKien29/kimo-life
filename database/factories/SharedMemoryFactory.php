<?php

namespace Database\Factories;

use App\Models\SharedMemory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SharedMemory> */
class SharedMemoryFactory extends Factory
{
    protected $model = SharedMemory::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'memory_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'owner_id' => User::factory(),
        ];
    }
}
