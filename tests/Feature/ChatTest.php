<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Friendship;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_friends_can_start_a_direct_chat_and_send_text_or_image(): void
    {
        [$owner, $friend] = $this->friends();
        $disk = config('kimo.photos.disk', 'public');
        Storage::fake($disk);

        $this->actingAs($owner)->post(route('chat.conversations.start'), ['friend_id' => $friend->id])->assertRedirect();
        $conversation = Conversation::query()->firstOrFail();
        $this->assertDatabaseCount('conversation_members', 2);

        $this->actingAs($owner)->post(route('chat.messages.store', $conversation), ['body' => 'Chào bạn!'])->assertRedirect();
        $this->actingAs($friend)->post(route('chat.messages.store', $conversation), [
            'body' => 'Một tấm ảnh từ hôm nay.',
            'image' => UploadedFile::fake()->image('today.jpg'),
        ])->assertRedirect();

        $this->assertDatabaseHas('messages', ['conversation_id' => $conversation->id, 'sender_id' => $owner->id, 'body' => 'Chào bạn!']);
        $message = Message::query()->where('sender_id', $friend->id)->firstOrFail();
        Storage::disk($disk)->assertExists($message->image_path);
        $this->actingAs($friend)->get(route('chat', ['conversation' => $conversation->id]))->assertOk()->assertInertia(fn ($page) => $page
            ->component('Chat/Index')
            ->where('activeConversation.messages.0.body', 'Chào bạn!')
            ->where('activeConversation.messages.1.body', 'Một tấm ảnh từ hôm nay.'));
    }

    public function test_chat_is_limited_to_accepted_friends_and_conversation_members(): void
    {
        [$owner, $friend] = $this->friends();
        $stranger = User::factory()->create();

        $this->actingAs($stranger)->post(route('chat.conversations.start'), ['friend_id' => $owner->id])->assertSessionHasErrors('friend_id');
        $conversation = Conversation::query()->create(['type' => 'direct']);
        ConversationMember::query()->create(['conversation_id' => $conversation->id, 'user_id' => $owner->id]);
        ConversationMember::query()->create(['conversation_id' => $conversation->id, 'user_id' => $friend->id]);

        $this->actingAs($stranger)->get(route('chat', ['conversation' => $conversation->id]))->assertForbidden();
        $this->actingAs($stranger)->post(route('chat.messages.store', $conversation), ['body' => 'Không được phép.'])->assertForbidden();
    }

    /** @return array{0: User, 1: User} */
    private function friends(): array
    {
        $owner = User::factory()->create();
        $friend = User::factory()->create();
        Friendship::factory()->for($owner, 'user')->for($friend, 'friend')->accepted()->create();

        return [$owner, $friend];
    }
}
