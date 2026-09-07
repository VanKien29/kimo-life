<?php

namespace Tests\Feature;

use App\Models\Memory;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TodayTest extends TestCase
{
    use RefreshDatabase;

    public function test_today_dashboard_contains_only_today_data_and_computed_summary(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $today = CarbonImmutable::now($user->timezone)->toDateString();
        $yesterday = CarbonImmutable::now($user->timezone)->subDay()->toDateString();
        $tomorrow = CarbonImmutable::now($user->timezone)->addDay()->toDateString();
        $activity = $user->activities()->create(['name' => 'Đi bộ', 'icon' => 'footprints', 'color' => 'green']);
        $todayMemory = Memory::factory()->create([
            'user_id' => $user->id,
            'memory_date' => $today,
            'mood' => 'vui',
        ]);
        $todayMemory->activities()->attach($activity);
        Memory::factory()->create(['user_id' => $user->id, 'memory_date' => $yesterday]);
        Memory::factory()->create(['user_id' => $user->id, 'memory_date' => $tomorrow]);

        $this->actingAs($user)->get(route('today'))->assertInertia(fn (Assert $page) => $page
            ->component('Today/Index')
            ->where('today.date', $today)
            ->where('today.weekday', $this->weekdayLabel(CarbonImmutable::now($user->timezone)))
            ->where('stats.moments', 1)
            ->where('stats.activities', 1)
            ->where('stats.mood.value', 'vui')
            ->where('stats.streak', 2)
            ->has('memories', 1)
            ->where('memories.0.id', $todayMemory->id)
            ->where('activities.0.name', 'Đi bộ')
        );
    }

    private function weekdayLabel(CarbonImmutable $date): string
    {
        return [
            'Chủ nhật',
            'Thứ Hai',
            'Thứ Ba',
            'Thứ Tư',
            'Thứ Năm',
            'Thứ Sáu',
            'Thứ Bảy',
        ][$date->dayOfWeek];
    }
}
