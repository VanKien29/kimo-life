<?php

namespace Tests\Feature;

use App\Models\Friendship;
use App\Models\Memory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FriendshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_accept_and_remove_a_friend_request(): void
    {
        $sender = User::factory()->create(['username' => 'kien']);
        $receiver = User::factory()->create(['username' => 'minh']);

        $this->actingAs($sender)->post(route('friendships.store'), ['friend_id' => $receiver->id])->assertRedirect(route('together'));
        $friendship = Friendship::query()->firstOrFail();
        $this->assertSame('pending', $friendship->status);

        $this->actingAs($receiver)->get(route('together'))->assertInertia(fn (Assert $page) => $page
            ->where('incomingRequests.0.id', $friendship->id)
            ->where('incomingRequests.0.user.id', $sender->id)
        );

        $this->actingAs($receiver)->patch(route('friendships.accept', $friendship))->assertRedirect(route('together'));
        $this->assertSame('accepted', $friendship->fresh()->status);

        $this->actingAs($sender)->get(route('together'))->assertInertia(fn (Assert $page) => $page
            ->where('stats.friends', 1)
            ->where('friends.0.user.id', $receiver->id)
        );

        $this->actingAs($sender)->delete(route('friendships.destroy', $friendship))->assertRedirect(route('together'));
        $this->assertDatabaseMissing('friendships', ['id' => $friendship->id]);
    }

    public function test_receiver_can_decline_and_sender_can_request_again(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $this->actingAs($sender)->post(route('friendships.store'), ['friend_id' => $receiver->id]);
        $friendship = Friendship::query()->firstOrFail();
        $this->actingAs($receiver)->patch(route('friendships.decline', $friendship));
        $this->assertSame('declined', $friendship->fresh()->status);

        $this->actingAs($sender)->post(route('friendships.store'), ['friend_id' => $receiver->id])->assertRedirect(route('together'));
        $this->assertSame('pending', $friendship->fresh()->status);
    }

    public function test_user_search_excludes_self_and_existing_connections(): void
    {
        $user = User::factory()->create(['username' => 'kien']);
        $friend = User::factory()->create(['name' => 'Minh Nguyễn', 'username' => 'minh']);
        $newUser = User::factory()->create(['name' => 'Minh Anh', 'username' => 'minh-anh']);
        Friendship::factory()->accepted()->create(['user_id' => $user->id, 'friend_id' => $friend->id]);

        $this->actingAs($user)->get(route('together', ['q' => 'minh']))->assertInertia(fn (Assert $page) => $page
            ->where('searchQuery', 'minh')
            ->has('searchResults', 1)
            ->where('searchResults.0.id', $newUser->id)
        );
    }

    public function test_blocked_users_cannot_send_a_new_request(): void
    {
        $blocker = User::factory()->create();
        $blocked = User::factory()->create();
        $friendship = Friendship::factory()->accepted()->create(['user_id' => $blocker->id, 'friend_id' => $blocked->id]);

        $this->actingAs($blocker)->patch(route('friendships.block', $friendship))->assertRedirect(route('together'));
        $this->assertSame('blocked', $friendship->fresh()->status);

        $this->actingAs($blocked)->post(route('friendships.store'), ['friend_id' => $blocker->id])->assertSessionHasErrors('friend_id');
        $this->assertSame(1, Friendship::query()->count());
    }

    public function test_friends_only_memory_requires_an_accepted_friendship_and_block_removes_access(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $friendsMemory = Memory::factory()->create(['user_id' => $owner->id, 'visibility' => 'friends']);
        $privateMemory = Memory::factory()->create(['user_id' => $owner->id, 'visibility' => 'private']);

        $this->actingAs($visitor)->get(route('memory.show', $friendsMemory))->assertForbidden();
        $friendship = Friendship::factory()->accepted()->create(['user_id' => $owner->id, 'friend_id' => $visitor->id]);
        $this->actingAs($visitor)->get(route('memory.show', $friendsMemory))->assertOk();
        $this->actingAs($visitor)->get(route('memory.show', $privateMemory))->assertForbidden();

        $this->actingAs($owner)->patch(route('friendships.block', $friendship))->assertRedirect(route('together'));
        $this->actingAs($visitor)->get(route('memory.show', $friendsMemory))->assertForbidden();
    }

    public function test_profile_page_exposes_private_counts_for_the_current_user(): void
    {
        $user = User::factory()->create(['username' => 'kien']);
        Memory::factory()->count(2)->create(['user_id' => $user->id]);
        Friendship::factory()->accepted()->create(['user_id' => $user->id, 'friend_id' => User::factory()]);

        $this->actingAs($user)->get(route('profile'))->assertInertia(fn (Assert $page) => $page
            ->component('Profile/Index')
            ->where('profile.username', 'kien')
            ->where('profile.memory_count', 2)
            ->where('profile.friends_count', 1)
        );
    }
}
