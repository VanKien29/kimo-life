<?php

namespace Database\Factories;

use App\Models\GroupChallenge;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<GroupChallenge> */
class GroupChallengeFactory extends Factory
{
    protected $model = GroupChallenge::class;

    public function definition(): array
    {
        $startDate = now()->startOfDay();
        $duration = 30;

        return [
            'name' => fake()->sentence(3),
            'goal' => $duration,
            'duration' => $duration,
            'start_date' => $startDate->toDateString(),
            'end_date' => $startDate->copy()->addDays($duration - 1)->toDateString(),
            'created_by' => User::factory(),
            'status' => 'active',
        ];
    }
}
