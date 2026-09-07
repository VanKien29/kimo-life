<?php

namespace App\Http\Controllers;

use App\Events\MessageCreated;
use App\Models\Conversation;
use App\Models\Friendship;
use App\Models\Message;
use App\Models\Memory;
use App\Models\SharedMemory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $conversations = Conversation::query()
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id))
            ->with(['members.user', 'latestMessage.sender', 'latestMessage.sharedMemory', 'latestMessage.memory'])
            ->latest('updated_at')
            ->get()
            ->map(fn (Conversation $conversation) => $this->conversationData($conversation, $user->id))
            ->values();
        $activeId = $request->integer('conversation');
        $conversationId = $activeId > 0 ? $activeId : ($conversations->first()['id'] ?? null);
        $activeConversation = $conversationId
            ? Conversation::query()->whereKey($conversationId)->with(['members.user', 'messages.sender', 'messages.sharedMemory', 'messages.memory.photos'])->first()
            : null;

        if ($activeConversation) {
            $this->authorize('view', $activeConversation);
            $activeConversation->members()->where('user_id', $user->id)->update(['last_read_at' => now()]);
            $conversations = $conversations->map(fn (array $item) => $item['id'] === $activeConversation->id ? [...$item, 'unread_count' => 0] : $item);
        }

        $friends = $this->acceptedFriends($user->id);
        $sharedMemories = SharedMemory::query()
            ->where(fn ($query) => $query->where('owner_id', $user->id)->orWhereHas('participants', fn ($participantQuery) => $participantQuery->where('user_id', $user->id)->where('status', 'accepted')))
            ->latest('memory_date')
            ->limit(20)
            ->get(['id', 'title', 'memory_date'])
            ->map(fn (SharedMemory $memory) => ['id' => $memory->id, 'title' => $memory->title, 'memory_date' => $memory->memory_date?->format('Y-m-d')])
            ->values();

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
            'activeConversation' => $activeConversation ? $this->activeConversationData($activeConversation, $user->id) : null,
            'friends' => $friends,
            'sharedMemories' => $sharedMemories,
        ]);
    }

    public function start(Request $request): RedirectResponse
    {
        $data = $request->validate(['friend_id' => ['required', 'integer', 'exists:users,id']]);
        $user = $request->user();
        $friendId = (int) $data['friend_id'];

        if ($friendId === $user->id || ! $this->areAcceptedFriends($user->id, $friendId)) {
            throw ValidationException::withMessages(['friend_id' => 'Chỉ có thể bắt đầu trò chuyện với bạn bè đã kết nối.']);
        }

        $conversation = Conversation::query()
            ->where('type', 'direct')
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id))
            ->whereHas('members', fn ($query) => $query->where('user_id', $friendId))
            ->first();

        if (! $conversation) {
            $conversation = $this->createDirectConversation($user->id, $friendId);
        }

        return to_route('chat', ['conversation' => $conversation->id]);
    }

    public function send(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('send', $conversation);
        $data = $request->validate([
            'body' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'shared_memory_id' => ['nullable', 'integer', 'exists:shared_memories,id'],
        ]);
        $body = trim((string) ($data['body'] ?? ''));
        $sharedMemory = ! empty($data['shared_memory_id']) ? SharedMemory::query()->findOrFail($data['shared_memory_id']) : null;

        if ($body === '' && ! $request->hasFile('image') && ! $sharedMemory) {
            throw ValidationException::withMessages(['body' => 'Hãy viết tin nhắn, chọn ảnh hoặc đính kèm kỷ niệm.']);
        }

        if ($sharedMemory) {
            abort_unless($this->canAccessSharedMemory($sharedMemory, $request->user()->id), 403);
        }

        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('chat/'.$request->user()->id, config('kimo.photos.disk', 'public'))
            : null;
        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $body !== '' ? $body : null,
            'image_path' => $imagePath,
            'shared_memory_id' => $sharedMemory?->id,
        ])->load(['sender', 'sharedMemory', 'memory.photos']);
        $conversation->touch();

        broadcast(new MessageCreated($message))->toOthers();

        return back();
    }

    public function sendMemoryMessage(Request $request, Memory $memory): RedirectResponse
    {
        $this->authorize('view', $memory);

        $user = $request->user();
        abort_if($memory->user_id === $user->id, 422, 'Bạn không thể gửi khoảnh khắc của chính mình cho mình.');

        $conversation = Conversation::query()
            ->where('type', 'direct')
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id))
            ->whereHas('members', fn ($query) => $query->where('user_id', $memory->user_id))
            ->first();

        $conversation ??= $this->createDirectConversation($user->id, $memory->user_id);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => 'Mình vừa xem khoảnh khắc này của bạn 🌿',
            'memory_id' => $memory->id,
        ])->load(['sender', 'memory.photos']);

        $conversation->touch();
        broadcast(new MessageCreated($message))->toOthers();

        return to_route('chat', ['conversation' => $conversation->id])
            ->with('status', 'Đã gửi khoảnh khắc vào tin nhắn.');
    }

    /** @return array<string, mixed> */
    private function conversationData(Conversation $conversation, int $userId): array
    {
        $member = $conversation->members->firstWhere('user_id', $userId);
        $other = $conversation->members->first(fn ($item) => $item->user_id !== $userId)?->user;
        $latest = $conversation->latestMessage;
        $unread = $member?->last_read_at
            ? $conversation->messages()->where('sender_id', '!=', $userId)->where('created_at', '>', $member->last_read_at)->count()
            : $conversation->messages()->where('sender_id', '!=', $userId)->count();

        return [
            'id' => $conversation->id,
            'name' => $other?->name ?? $conversation->title ?? 'Trò chuyện',
            'avatar' => $other?->avatar,
            'other_user_id' => $other?->id,
            'last_message' => $latest?->body ?? ($latest?->image_path ? 'Đã gửi một ảnh.' : ($latest?->memory ? 'Đã gửi một khoảnh khắc.' : ($latest?->shared_memory ? 'Đã chia sẻ một kỷ niệm.' : null))),
            'last_message_at' => $latest?->created_at?->toISOString(),
            'unread_count' => $unread,
        ];
    }

    /** @return array<string, mixed> */
    private function activeConversationData(Conversation $conversation, int $userId): array
    {
        $other = $conversation->members->first(fn ($item) => $item->user_id !== $userId)?->user;
        $messages = $conversation->messages->sortBy('id')->values()->take(-100);

        return [
            'id' => $conversation->id,
            'name' => $other?->name ?? $conversation->title ?? 'Trò chuyện',
            'avatar' => $other?->avatar,
            'other_user_id' => $other?->id,
            'messages' => $messages->map(fn (Message $message) => (new MessageCreated($message))->messageData())->values(),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function acceptedFriends(int $userId): array
    {
        $friendIds = Friendship::query()->where('status', 'accepted')->where(fn ($query) => $query->where('user_id', $userId)->orWhere('friend_id', $userId))->get(['user_id', 'friend_id'])->flatMap(fn (Friendship $friendship) => [$friendship->user_id, $friendship->friend_id])->reject(fn (int $id) => $id === $userId)->unique();

        return User::query()->whereIn('id', $friendIds)->orderBy('name')->get(['id', 'name', 'username', 'avatar'])->map(fn (User $friend) => ['id' => $friend->id, 'name' => $friend->name, 'username' => $friend->username, 'avatar' => $friend->avatar])->all();
    }

    private function areAcceptedFriends(int $userId, int $friendId): bool
    {
        return Friendship::query()->where('status', 'accepted')->where(fn ($query) => $query->where(fn ($query) => $query->where('user_id', $userId)->where('friend_id', $friendId))->orWhere(fn ($query) => $query->where('user_id', $friendId)->where('friend_id', $userId)))->exists();
    }

    private function canAccessSharedMemory(SharedMemory $sharedMemory, int $userId): bool
    {
        return $sharedMemory->owner_id === $userId || $sharedMemory->participants()->where('user_id', $userId)->where('status', 'accepted')->exists();
    }

    private function createDirectConversation(int $userId, int $otherUserId): Conversation
    {
        return DB::transaction(function () use ($userId, $otherUserId): Conversation {
            $conversation = Conversation::query()->create(['type' => 'direct']);
            $conversation->members()->createMany([
                ['user_id' => $userId],
                ['user_id' => $otherUserId],
            ]);

            return $conversation;
        });
    }
}
