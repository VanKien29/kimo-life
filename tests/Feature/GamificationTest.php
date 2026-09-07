<?php

namespace Tests\Feature;

use App\Models\DuoStreak;
use App\Models\Memory;
use App\Models\SharedMemory;
use App\Models\Streak;
use App\Models\User;
use App\Services\GamificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GamificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_quest_completion_and_first_memory_achievement_are_idempotent(): void
    {
        $user = User::factory()->create();
        Memory::factory()->for($user)->create();
        $service = app(GamificationService::class);

        $service->completeQuest($user, 'save_memory');
        $service->completeQuest($user, 'save_memory');

        $this->assertDatabaseCount('daily_quest_completions', 1);
        $this->assertDatabaseHas('daily_quest_completions', [
            'user_id' => $user->id,
            'quest_key' => 'save_memory',
        ]);
        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
            'achievement_key' => 'first_memory',
        ]);
    }

    public function test_milestones_are_synced_from_reliable_domain_data(): void
    {
        $user = User::factory()->create();
        Memory::factory()->count(10)->for($user)->create();
        Streak::factory()->for($user)->create(['best_streak' => 7]);
        SharedMemory::factory()->for($user, 'owner')->create();
        DuoStreak::factory()->for($user, 'creator')->create();

        app(GamificationService::class)->syncAchievements($user);

        $this->assertDatabaseHas('user_achievements', ['user_id' => $user->id, 'achievement_key' => 'memories_10']);
        $this->assertDatabaseHas('user_achievements', ['user_id' => $user->id, 'achievement_key' => 'streak_7']);
        $this->assertDatabaseHas('user_achievements', ['user_id' => $user->id, 'achievement_key' => 'first_shared_memory']);
        $this->assertDatabaseHas('user_achievements', ['user_id' => $user->id, 'achievement_key' => 'first_duo_streak']);
    }

    public function test_today_exposes_daily_quests_and_achievements_in_vietnamese(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        Memory::factory()->for($user)->create();

        $this->actingAs($user)->get(route('today'))->assertInertia(fn ($page) => $page
            ->component('Today/Index')
            ->has('dailyQuests', 4)
            ->where('dailyQuests.0.label', 'Lưu một khoảnh khắc')
            ->where('questProgress.total', 4)
            ->where('achievements.0.label', 'Khoảnh khắc đầu tiên')
        );
    }
}
