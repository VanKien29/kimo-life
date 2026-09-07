<?php

namespace Tests\Feature;

use App\Models\Memory;
use App\Models\MemoryComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemoryInteractionTest extends TestCase
{
    use RefreshDatabase;

    public function test_visible_memory_supports_reactions_comments_and_own_comment_deletion(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $memory = Memory::factory()->create(['user_id' => $owner->id, 'visibility' => 'public']);

        $this->actingAs($visitor)->post(route('memory.reactions.toggle', $memory), ['reaction' => '❤️'])->assertRedirect();
        $this->actingAs($visitor)->post(route('memory.comments.store', $memory), ['content' => 'Một khoảnh khắc thật đẹp.'])->assertRedirect();

        $comment = MemoryComment::query()->firstOrFail();
        $this->assertDatabaseHas('memory_reactions', ['memory_id' => $memory->id, 'user_id' => $visitor->id, 'reaction' => '❤️']);
        $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'type' => 'reaction', 'actor_id' => $visitor->id]);
        $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'type' => 'comment', 'actor_id' => $visitor->id]);

        $this->actingAs($visitor)->get(route('memory.show', $memory))->assertOk()->assertInertia(fn ($page) => $page
            ->component('Memory/Show')
            ->where('memory.reactions.0.count', 1)
            ->where('memory.comments.0.content', 'Một khoảnh khắc thật đẹp.'));

        $this->actingAs($owner)->delete(route('memory.comments.destroy', [$memory, $comment]))->assertForbidden();
        $this->actingAs($visitor)->delete(route('memory.comments.destroy', [$memory, $comment]))->assertRedirect();
        $this->assertDatabaseMissing('memory_comments', ['id' => $comment->id]);
    }

    public function test_private_memory_cannot_be_interacted_with_by_another_user(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $memory = Memory::factory()->create(['user_id' => $owner->id, 'visibility' => 'private']);

        $this->actingAs($visitor)->post(route('memory.reactions.toggle', $memory), ['reaction' => '🔥'])->assertForbidden();
        $this->actingAs($visitor)->post(route('memory.comments.store', $memory), ['content' => 'Không được phép.'])->assertForbidden();
    }

    public function test_reaction_can_be_toggled_off(): void
    {
        $user = User::factory()->create();
        $memory = Memory::factory()->create(['user_id' => $user->id, 'visibility' => 'private']);

        $this->actingAs($user)->post(route('memory.reactions.toggle', $memory), ['reaction' => '🥹'])->assertRedirect();
        $this->actingAs($user)->post(route('memory.reactions.toggle', $memory), ['reaction' => '🥹'])->assertRedirect();

        $this->assertDatabaseCount('memory_reactions', 0);
    }
}
