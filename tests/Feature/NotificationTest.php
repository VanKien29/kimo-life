<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_friend_actions_create_notifications_and_user_can_read_them(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $this->actingAs($sender)->post(route('friendships.store'), ['friend_id' => $recipient->id])->assertRedirect();
        $this->assertDatabaseHas('notifications', ['user_id' => $recipient->id, 'type' => 'friend_request']);

        $friendship = Friendship::query()->firstOrFail();
        $this->actingAs($recipient)->patch(route('friendships.accept', $friendship))->assertRedirect();
        $this->assertDatabaseHas('notifications', ['user_id' => $sender->id, 'type' => 'friend_accepted']);

        $notification = AppNotification::query()->where('user_id', $recipient->id)->firstOrFail();
        $this->actingAs($recipient)->get(route('notifications.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->where('unreadCount', 1));
        $this->actingAs($recipient)->patch(route('notifications.read', $notification))->assertRedirect();
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_read_all_only_marks_current_users_notifications(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        AppNotification::query()->create(['user_id' => $user->id, 'type' => 'streak', 'data' => []]);
        AppNotification::query()->create(['user_id' => $other->id, 'type' => 'streak', 'data' => []]);

        $this->actingAs($user)->patch(route('notifications.read-all'))->assertRedirect();
        $this->assertNotNull(AppNotification::query()->where('user_id', $user->id)->firstOrFail()->read_at);
        $this->assertNull(AppNotification::query()->where('user_id', $other->id)->firstOrFail()->read_at);
    }
}
