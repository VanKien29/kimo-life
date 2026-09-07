<?php

namespace Tests\Feature;

use App\Models\Memory;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_returns_month_navigation_and_day_indicators(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $month = CarbonImmutable::create(2026, 9, 1, 0, 0, 0, $user->timezone);
        $memory = Memory::factory()->create([
            'user_id' => $user->id,
            'memory_date' => $month->setDay(5)->toDateString(),
            'mood' => 'vui',
        ]);

        $this->actingAs($user)->get(route('calendar', ['month' => $month->format('Y-m')]))->assertInertia(fn (Assert $page) => $page
            ->component('Calendar/Index')
            ->where('calendar.label', 'Tháng 9 2026')
            ->where('calendar.previous', '2026-08')
            ->where('calendar.next', '2026-10')
            ->has('days', 30)
            ->where('days.4.date', '2026-09-05')
            ->where('days.4.memory_count', 1)
            ->where('days.4.mood', 'vui')
            ->where('days.4.thumbnail', null)
            ->where('today', CarbonImmutable::now($user->timezone)->toDateString())
        );

        $this->assertDatabaseHas('memories', ['id' => $memory->id]);
    }

    public function test_day_detail_only_shows_memories_owned_by_the_current_user(): void
    {
        $owner = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $visitor = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $date = '2026-09-05';
        $activity = $owner->activities()->create(['name' => 'Đọc sách']);
        $ownMemory = Memory::factory()->create(['user_id' => $owner->id, 'memory_date' => $date, 'mood' => 'binh-yen']);
        $ownMemory->activities()->attach($activity);
        Memory::factory()->create(['user_id' => $visitor->id, 'memory_date' => $date]);

        $this->actingAs($owner)->get(route('calendar.day', $date))->assertInertia(fn (Assert $page) => $page
            ->component('Calendar/Day')
            ->where('day.date', $date)
            ->where('stats.memories', 1)
            ->where('stats.activities', 1)
            ->where('stats.mood.value', 'binh-yen')
            ->has('memories', 1)
            ->where('memories.0.id', $ownMemory->id)
        );

        $this->actingAs($visitor)->get(route('calendar.day', $date))->assertInertia(fn (Assert $page) => $page
            ->component('Calendar/Day')
            ->where('stats.memories', 1)
            ->has('memories', 1)
            ->where('memories.0.id', Memory::query()->where('user_id', $visitor->id)->value('id'))
        );
    }

    public function test_empty_day_has_an_empty_detail_state(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);

        $this->actingAs($user)->get(route('calendar.day', '2026-09-06'))->assertInertia(fn (Assert $page) => $page
            ->component('Calendar/Day')
            ->where('stats.memories', 0)
            ->where('stats.activities', 0)
            ->where('stats.mood', null)
            ->has('memories', 0)
        );
    }
}
