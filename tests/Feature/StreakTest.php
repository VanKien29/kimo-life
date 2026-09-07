<?php

namespace Tests\Feature;

use App\Models\Streak;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StreakTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_a_streak_uses_the_current_user_date_without_exposing_a_date_field(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $today = CarbonImmutable::now($user->timezone)->toDateString();

        $this->actingAs($user)->post(route('streak.store'), [
            'name' => 'Uống nước',
            'icon' => 'coffee',
            'color' => 'blue',
            'goal_type' => 'every_day',
        ])->assertRedirect(route('streak'));

        $streak = $user->streaks()->firstOrFail();
        $this->assertSame($today, $streak->start_date->toDateString());
        $this->assertSame(0, $streak->current_streak);
        $this->assertSame(0, $streak->best_streak);
    }

    public function test_first_check_in_starts_current_and_best_streak(): void
    {
        $user = User::factory()->create();
        $streak = Streak::factory()->for($user)->create();

        $this->actingAs($user)->post(route('streak.check-in', $streak))->assertRedirect();

        $this->assertTrue($streak->logs()->whereDate('date', CarbonImmutable::now($user->timezone)->toDateString())->where('completed', true)->exists());
        $this->assertSame(1, $streak->fresh()->current_streak);
        $this->assertSame(1, $streak->fresh()->best_streak);
    }

    public function test_consecutive_check_ins_extend_the_current_streak(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();
        $streak = Streak::factory()->for($user)->create(['start_date' => $today->subDay()->toDateString()]);
        $streak->logs()->create(['date' => $today->subDay()->toDateString(), 'completed' => true]);

        $this->actingAs($user)->post(route('streak.check-in', $streak));

        $fresh = $streak->fresh();
        $this->assertSame(2, $fresh->current_streak);
        $this->assertSame(2, $fresh->best_streak);
    }

    public function test_a_broken_streak_resets_current_but_keeps_best(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();
        $streak = Streak::factory()->for($user)->create(['start_date' => $today->subDays(3)->toDateString()]);
        $streak->logs()->createMany([
            ['date' => $today->subDays(3)->toDateString(), 'completed' => true],
            ['date' => $today->subDays(2)->toDateString(), 'completed' => true],
        ]);

        $this->actingAs($user)->post(route('streak.check-in', $streak));

        $fresh = $streak->fresh();
        $this->assertSame(1, $fresh->current_streak);
        $this->assertSame(2, $fresh->best_streak);
    }

    public function test_opening_the_page_after_skipping_today_resets_current_streak(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();
        $streak = Streak::factory()->for($user)->create([
            'start_date' => $today->subDay()->toDateString(),
            'current_streak' => 1,
            'best_streak' => 1,
        ]);
        $streak->logs()->create(['date' => $today->subDay()->toDateString(), 'completed' => true]);

        $this->actingAs($user)->get(route('streak'))->assertInertia(fn (Assert $page) => $page
            ->where('streaks.0.current_streak', 0)
            ->where('streaks.0.best_streak', 1)
        );
    }

    public function test_weekday_goal_rejects_a_day_outside_its_schedule(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();
        $otherDay = $today->dayOfWeekIso === 7 ? 1 : $today->dayOfWeekIso + 1;
        $streak = Streak::factory()->for($user)->create([
            'goal_type' => 'weekdays',
            'frequency' => ['days' => [$otherDay]],
        ]);

        $this->actingAs($user)->from(route('streak'))->post(route('streak.check-in', $streak))->assertSessionHasErrors('check_in');
        $this->assertDatabaseCount('streak_logs', 0);
    }

    public function test_weekly_goal_counts_a_completed_week_as_one_week(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();
        $previousWeek = $today->subWeek()->subDays($today->subWeek()->dayOfWeekIso - 1);
        $streak = Streak::factory()->for($user)->create([
            'goal_type' => 'x_days_per_week',
            'frequency' => ['count' => 3],
            'start_date' => $previousWeek->toDateString(),
        ]);
        $streak->logs()->createMany([
            ['date' => $previousWeek->toDateString(), 'completed' => true],
            ['date' => $previousWeek->addDay()->toDateString(), 'completed' => true],
            ['date' => $previousWeek->addDays(2)->toDateString(), 'completed' => true],
        ]);

        $this->actingAs($user)->post(route('streak.check-in', $streak));

        $this->assertSame(0, $streak->fresh()->current_streak);
        $this->assertSame(1, $streak->fresh()->best_streak);
    }

    public function test_streak_page_serializes_heatmap_and_timezone_date(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $streak = Streak::factory()->for($user)->create();

        $this->actingAs($user)->get(route('streak'))->assertInertia(fn (Assert $page) => $page
            ->component('Streak/Index')
            ->has('streaks', 1)
            ->where('streaks.0.id', $streak->id)
            ->has('streaks.0.heatmap', 84)
            ->where('streaks.0.start_date', CarbonImmutable::now($user->timezone)->toDateString())
            ->where('streaks.0.unit_label', 'ngày')
        );
    }
}
