<?php

namespace Tests\Feature;

use App\Models\Memory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MemorySearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_matches_title_content_tag_and_activity_on_the_server(): void
    {
        $user = User::factory()->create();
        $activity = $user->activities()->create(['name' => 'Đi bộ', 'icon' => 'footprints', 'color' => 'green']);
        $memory = Memory::factory()->create([
            'user_id' => $user->id,
            'title' => 'Chuyến đi Đà Lạt',
            'content' => 'Một buổi sáng nhiều nắng.',
            'mood' => 'vui',
            'location' => 'Đà Lạt',
            'memory_date' => '2026-09-04',
        ]);
        $memory->activities()->attach($activity);
        $memory->tags()->attach($user->tags()->create(['name' => 'travel']));

        foreach (['Đà Lạt', 'nhiều nắng', 'travel', 'Đi bộ'] as $term) {
            $this->actingAs($user)->get(route('memory.index', ['q' => $term]))->assertInertia(fn (Assert $page) => $page
                ->component('Memory/Index')
                ->where('search.q', $term)
                ->where('search.is_searching', true)
                ->where('memories.total', 1)
                ->where('memories.data.0.id', $memory->id)
            );
        }
    }

    public function test_search_filters_by_date_activity_mood_tag_and_location(): void
    {
        $user = User::factory()->create();
        $activity = $user->activities()->create(['name' => 'Đọc sách', 'icon' => 'book-open', 'color' => 'blue']);
        $tag = $user->tags()->create(['name' => 'daily']);
        $matching = Memory::factory()->create([
            'user_id' => $user->id,
            'memory_date' => '2026-09-05',
            'mood' => 'binh-yen',
            'location' => 'Đà Nẵng',
        ]);
        $matching->activities()->attach($activity);
        $matching->tags()->attach($tag);
        $other = Memory::factory()->create([
            'user_id' => $user->id,
            'memory_date' => '2026-08-01',
            'mood' => 'vui',
            'location' => 'Hà Nội',
        ]);
        $other->activities()->attach($activity);
        $other->tags()->attach($tag);

        $this->actingAs($user)->get(route('memory.index', [
            'date_from' => '2026-09-01',
            'date_to' => '2026-09-30',
            'activity_id' => $activity->id,
            'mood' => 'binh-yen',
            'tag' => '#daily',
            'location' => 'Đà',
        ]))->assertInertia(fn (Assert $page) => $page
            ->where('search.date_from', '2026-09-01')
            ->where('search.date_to', '2026-09-30')
            ->where('search.activity_id', $activity->id)
            ->where('search.mood', 'binh-yen')
            ->where('search.tag', 'daily')
            ->where('search.location', 'Đà')
            ->where('memories.total', 1)
            ->where('memories.data.0.id', $matching->id)
        );
    }

    public function test_search_is_limited_to_the_current_users_memories_and_is_paginated(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $ownMemory = Memory::factory()->create(['user_id' => $owner->id, 'title' => 'Từ khóa riêng']);
        Memory::factory()->create(['user_id' => $visitor->id, 'title' => 'Từ khóa riêng']);

        $this->actingAs($owner)->get(route('memory.index', ['q' => 'Từ khóa riêng']))->assertInertia(fn (Assert $page) => $page
            ->where('memories.total', 1)
            ->where('memories.data.0.id', $ownMemory->id)
        );

        for ($index = 0; $index < 21; $index++) {
            Memory::factory()->create(['user_id' => $owner->id, 'title' => 'Danh sách tìm kiếm']);
        }

        $this->actingAs($owner)->get(route('memory.index', ['q' => 'Danh sách tìm kiếm']))->assertInertia(fn (Assert $page) => $page
            ->where('memories.total', 21)
            ->where('memories.last_page', 2)
            ->where('memories.next_page_url', fn ($url) => is_string($url) && str_contains($url, 'q='))
        );
    }
}
