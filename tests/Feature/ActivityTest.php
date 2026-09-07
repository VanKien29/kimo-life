<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_update_and_archive_an_activity(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('activities.store'), [
            'name' => 'Đọc sách',
            'icon' => 'book-open',
            'color' => 'blue',
        ])->assertRedirect(route('activities.index'));

        $activity = $user->activities()->firstOrFail();
        $this->assertDatabaseHas('activities', ['id' => $activity->id, 'name' => 'Đọc sách', 'archived_at' => null]);

        $this->actingAs($user)->patch(route('activities.update', $activity), [
            'name' => 'Đọc sách buổi tối',
            'icon' => 'book-open',
            'color' => 'purple',
        ])->assertRedirect(route('activities.index'));

        $this->actingAs($user)->patch(route('activities.archive', $activity))->assertRedirect(route('activities.index'));
        $this->assertNotNull($activity->fresh()->archived_at);
    }

    public function test_activity_index_hides_archived_activities(): void
    {
        $user = User::factory()->create();
        $active = $user->activities()->create(['name' => 'Đi bộ', 'icon' => 'footprints', 'color' => 'green']);
        $archived = $user->activities()->create(['name' => 'Cũ', 'icon' => 'coffee', 'color' => 'orange', 'archived_at' => now()]);

        $this->actingAs($user)->get(route('activities.index'))->assertInertia(fn (Assert $page) => $page
            ->component('Activities/Index')
            ->where('activities.0.id', $active->id)
            ->where('activities.0.name', 'Đi bộ')
            ->where('archivedActivities.0.id', $archived->id)
        );
    }

    public function test_user_cannot_update_or_archive_another_users_activity(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $activity = $owner->activities()->create(['name' => 'Riêng tư', 'icon' => 'sparkles', 'color' => 'green']);

        $this->actingAs($visitor)->patch(route('activities.update', $activity), [
            'name' => 'Không được sửa',
            'icon' => 'sparkles',
            'color' => 'green',
        ])->assertForbidden();

        $this->actingAs($visitor)->patch(route('activities.archive', $activity))->assertForbidden();
        $this->assertNull($activity->fresh()->archived_at);
    }
}
