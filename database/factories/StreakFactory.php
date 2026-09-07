<?php

namespace Database\Factories;

use App\Models\Streak;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Streak> */
class StreakFactory extends Factory
{
    protected $model = Streak::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->sentence(3),
            'icon' => 'sparkles',
            'color' => 'green',
            'goal_type' => 'every_day',
            'frequency' => null,
            'start_date' => now()->toDateString(),
            'active' => true,
            'current_streak' => 0,
            'best_streak' => 0,
        ];
    }
}
