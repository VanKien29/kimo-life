<?php

namespace Database\Factories;

use App\Models\Memory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Memory> */
class MemoryFactory extends Factory
{
    protected $model = Memory::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->optional()->sentence(3),
            'content' => fake()->sentence(),
            'memory_date' => fake()->date(),
            'mood' => 'binh-yen',
            'visibility' => 'private',
            'location' => fake()->optional()->city(),
        ];
    }
}
