<?php

namespace Database\Factories;

use App\Models\DuoStreak;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DuoStreak> */
class DuoStreakFactory extends Factory
{
    protected $model = DuoStreak::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'created_by' => User::factory(),
            'frequency' => 'daily',
            'start_date' => now()->toDateString(),
            'current_streak' => 0,
            'best_streak' => 0,
            'status' => 'active',
        ];
    }
}
