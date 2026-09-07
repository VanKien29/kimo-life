<?php

namespace Tests\Feature;

use App\Models\Friendship;
use App\Models\SharedMemory;
use App\Models\SharedMemoryParticipant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SharedMemoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_a_shared_memory_and_invite_an_accepted_friend(): void
    {
        $owner = User::factory()->create();
        $friend = User::factory()->create();
        Friendship::factory()->for($owner, 'user')->for($friend, 'friend')->accepted()->create();

        $response = $this->actingAs($owner)->post(route('shared-memories.store'), [
            'title' => 'Chuyến đi Đà Lạt',
            'description' => 'Một cuối tuần thật dịu.',
            'friend_ids' => [$friend->id],
        ]);

        $sharedMemory = SharedMemory::query()->firstOrFail();
        $response->assertRedirect(route('shared-memories.show', $sharedMemory, absolute: false));
        $this->assertDatabaseHas('shared_memory_users', [
            'shared_memory_id' => $sharedMemory->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'accepted',
        ]);
        $this->assertDatabaseHas('shared_memory_users', [
            'shared_memory_id' => $sharedMemory->id,
            'user_id' => $friend->id,
            'status' => 'pending',
        ]);
    }

    public function test_invited_friend_can_accept_and_contribute_photos_notes_and_reactions(): void
    {
        Storage::fake(config('kimo.photos.disk'));
        $owner = User::factory()->create();
        $friend = User::factory()->create();
        Friendship::factory()->for($owner, 'user')->for($friend, 'friend')->accepted()->create();
        $sharedMemory = SharedMemory::factory()->create(['owner_id' => $owner->id]);
        $participant = SharedMemoryParticipant::query()->create([
            'shared_memory_id' => $sharedMemory->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'accepted',
            'joined_at' => now(),
        ]);
        $invitation = SharedMemoryParticipant::query()->create([
            'shared_memory_id' => $sharedMemory->id,
            'user_id' => $friend->id,
            'role' => 'participant',
            'status' => 'pending',
        ]);

        $this->actingAs($friend)->get(route('shared-memories.show', $sharedMemory))->assertForbidden();
        $this->actingAs($friend)->patch(route('shared-memory-invitations.accept', $invitation))->assertRedirect(route('shared-memories.show', $sharedMemory, absolute: false));

        $this->actingAs($friend)->post(route('shared-memories.photos.store', $sharedMemory), [
            'photos' => [UploadedFile::fake()->image('dalat.jpg', 640, 480)],
        ])->assertRedirect();
        $this->actingAs($friend)->post(route('shared-memories.notes.store', $sharedMemory), ['content' => 'Mình nhớ buổi sáng nhiều sương.'])->assertRedirect();
        $this->actingAs($friend)->post(route('shared-memories.reactions.toggle', $sharedMemory), ['reaction' => '❤️'])->assertRedirect();

        $this->assertDatabaseHas('shared_memory_photos', ['shared_memory_id' => $sharedMemory->id, 'uploaded_by' => $friend->id]);
        $this->assertDatabaseHas('shared_memory_notes', ['shared_memory_id' => $sharedMemory->id, 'user_id' => $friend->id]);
        $this->assertDatabaseHas('shared_memory_reactions', ['shared_memory_id' => $sharedMemory->id, 'user_id' => $friend->id, 'reaction' => '❤️']);
        $this->assertNotNull($participant->fresh()->joined_at);
    }

    public function test_shared_memory_is_private_and_only_accepted_friends_can_be_invited(): void
    {
        $owner = User::factory()->create();
        $friend = User::factory()->create();
        $stranger = User::factory()->create();
        $sharedMemory = SharedMemory::factory()->create(['owner_id' => $owner->id]);
        SharedMemoryParticipant::query()->create([
            'shared_memory_id' => $sharedMemory->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'accepted',
            'joined_at' => now(),
        ]);

        $this->actingAs($stranger)->get(route('shared-memories.show', $sharedMemory))->assertForbidden();
        $this->actingAs($owner)->post(route('shared-memories.invite', $sharedMemory), ['user_id' => $friend->id])->assertSessionHasErrors('friend_ids');
        $this->assertDatabaseMissing('shared_memory_users', ['shared_memory_id' => $sharedMemory->id, 'user_id' => $friend->id]);
    }
}
