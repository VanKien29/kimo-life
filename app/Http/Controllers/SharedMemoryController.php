<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\SharedMemory;
use App\Models\SharedMemoryNote;
use App\Models\SharedMemoryParticipant;
use App\Models\SharedMemoryPhoto;
use App\Models\SharedMemoryReaction;
use App\Models\User;
use App\Services\AppNotificationService;
use App\Services\GamificationService;
use App\Services\MemoryPhotoStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SharedMemoryController extends Controller
{
    private const REACTIONS = ['❤️', '🔥', '👏', '✨', '😂', '🥹'];

    public function __construct(
        private readonly MemoryPhotoStorage $photoStorage,
        private readonly AppNotificationService $notifications,
        private readonly GamificationService $gamification,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $sharedMemories = SharedMemory::query()
            ->where(function ($query) use ($user): void {
                $query
                    ->where('owner_id', $user->id)
                    ->orWhereHas('participants', fn ($participantQuery) => $participantQuery
                        ->where('user_id', $user->id)
                        ->where('status', 'accepted'));
            })
            ->with(['owner', 'participants.user', 'photos.uploader', 'notes.user', 'reactions'])
            ->latest('memory_date')
            ->latest()
            ->get()
            ->map(fn (SharedMemory $sharedMemory) => $this->serializeSharedMemory($sharedMemory, $user->id))
            ->values();

        $invitations = SharedMemoryParticipant::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->with(['sharedMemory.owner', 'sharedMemory.participants.user'])
            ->latest()
            ->get()
            ->map(fn (SharedMemoryParticipant $participant) => [
                'id' => $participant->id,
                'shared_memory' => $this->serializeSharedMemory($participant->sharedMemory, $user->id),
                'invited_by' => $this->profileData($participant->sharedMemory->owner),
            ])
            ->values();

        return Inertia::render('SharedMemory/Index', [
            'sharedMemories' => $sharedMemories,
            'invitations' => $invitations,
            'friends' => $this->acceptedFriends($user),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:5000'],
            'memory_date' => ['nullable', 'date', 'before_or_equal:today'],
            'friend_ids' => ['nullable', 'array', 'max:20'],
            'friend_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            ...$this->photoRules(false),
        ]);
        $user = $request->user();
        $friendIds = collect($data['friend_ids'] ?? [])->map(fn ($id) => (int) $id)->unique()->values();

        $this->ensureAcceptedFriends($user, $friendIds);

        $sharedMemory = DB::transaction(function () use ($data, $friendIds, $user, $request): SharedMemory {
            $sharedMemory = SharedMemory::query()->create([
                'title' => trim($data['title']),
                'description' => isset($data['description']) ? trim($data['description']) : null,
                'memory_date' => $data['memory_date'] ?? $this->todayFor($request),
                'owner_id' => $user->id,
            ]);

            $sharedMemory->participants()->create([
                'user_id' => $user->id,
                'role' => 'owner',
                'status' => 'accepted',
                'joined_at' => now(),
            ]);

            foreach ($friendIds as $friendId) {
                $sharedMemory->participants()->create([
                    'user_id' => $friendId,
                    'role' => 'participant',
                    'status' => 'pending',
                ]);
            }

            return $sharedMemory;
        });

        try {
            $this->storePhotos($sharedMemory, $this->requestPhotos($request), $user->id);
        } catch (Throwable $exception) {
            $this->deletePhotos($sharedMemory->load('photos'));
            $sharedMemory->delete();
            report($exception);
            throw $exception;
        }

        $this->gamification->syncAchievements($user);

        return to_route('shared-memories.show', $sharedMemory)->with('status', 'Đã tạo không gian kỷ niệm chung.');
    }

    public function show(Request $request, SharedMemory $sharedMemory): Response
    {
        $this->ensureCanAccess($sharedMemory, $request->user()->id);
        $sharedMemory->load(['owner', 'participants.user', 'photos.uploader', 'notes.user', 'reactions']);

        return Inertia::render('SharedMemory/Show', [
            'sharedMemory' => $this->serializeSharedMemory($sharedMemory, $request->user()->id),
            'friends' => $this->acceptedFriends($request->user()),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(Request $request, SharedMemory $sharedMemory): RedirectResponse
    {
        $this->ensureOwner($sharedMemory, $request->user()->id);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:5000'],
            'memory_date' => ['required', 'date', 'before_or_equal:today'],
        ]);

        $sharedMemory->update([
            'title' => trim($data['title']),
            'description' => isset($data['description']) ? trim($data['description']) : null,
            'memory_date' => $data['memory_date'],
        ]);

        return to_route('shared-memories.show', $sharedMemory)->with('status', 'Đã cập nhật kỷ niệm chung.');
    }

    public function destroy(Request $request, SharedMemory $sharedMemory): RedirectResponse
    {
        $this->ensureOwner($sharedMemory, $request->user()->id);
        $this->deletePhotos($sharedMemory->load('photos'));
        $sharedMemory->delete();

        return to_route('shared-memories.index')->with('status', 'Đã xóa kỷ niệm chung.');
    }

    public function invite(Request $request, SharedMemory $sharedMemory): RedirectResponse
    {
        $this->ensureOwner($sharedMemory, $request->user()->id);
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);
        $targetId = (int) $data['user_id'];

        $this->ensureAcceptedFriends($request->user(), collect([$targetId]));
        $participant = $sharedMemory->participants()->where('user_id', $targetId)->first();

        if ($participant?->status === 'accepted' || $participant?->status === 'pending') {
            throw ValidationException::withMessages(['user_id' => 'Người này đã được mời vào kỷ niệm.']);
        }

        if ($participant) {
            $participant->update(['role' => 'participant', 'status' => 'pending', 'joined_at' => null]);
        } else {
            $sharedMemory->participants()->create([
                'user_id' => $targetId,
                'role' => 'participant',
                'status' => 'pending',
            ]);
        }

        $this->notifications->send($targetId, 'memory_share', $request->user()->id, [
            'message' => 'đã mời bạn vào một kỷ niệm chung.',
            'url' => route('shared-memories.show', $sharedMemory),
        ]);

        return back()->with('status', 'Đã gửi lời mời tham gia.');
    }

    public function acceptInvitation(Request $request, SharedMemoryParticipant $participant): RedirectResponse
    {
        $this->ensureInvitationOwner($participant, $request->user()->id);
        abort_unless($participant->status === 'pending', 404);
        $participant->update(['status' => 'accepted', 'joined_at' => now()]);

        return to_route('shared-memories.show', $participant->shared_memory_id)->with('status', 'Bạn đã tham gia kỷ niệm chung.');
    }

    public function declineInvitation(Request $request, SharedMemoryParticipant $participant): RedirectResponse
    {
        $this->ensureInvitationOwner($participant, $request->user()->id);
        abort_unless($participant->status === 'pending', 404);
        $participant->update(['status' => 'declined']);

        return to_route('shared-memories.index')->with('status', 'Đã bỏ qua lời mời.');
    }

    public function addPhotos(Request $request, SharedMemory $sharedMemory): RedirectResponse
    {
        $this->ensureCanContribute($sharedMemory, $request->user()->id);
        $request->validate($this->photoRules());
        $photos = $this->requestPhotos($request);
        $maxPhotos = (int) config('kimo.memory.max_photos', 10);

        if ($sharedMemory->photos()->count() + count($photos) > $maxPhotos) {
            throw ValidationException::withMessages(['photos' => "Một kỷ niệm chung chỉ có thể có tối đa {$maxPhotos} ảnh."]);
        }

        try {
            $this->storePhotos($sharedMemory, $photos, $request->user()->id, $sharedMemory->photos()->count());
        } catch (Throwable $exception) {
            report($exception);
            throw $exception;
        }

        return back()->with('status', 'Đã thêm ảnh vào kỷ niệm chung.');
    }

    public function addNote(Request $request, SharedMemory $sharedMemory): RedirectResponse
    {
        $this->ensureCanContribute($sharedMemory, $request->user()->id);
        $data = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
        ]);

        $sharedMemory->notes()->create([
            'user_id' => $request->user()->id,
            'content' => trim($data['content']),
        ]);
        $this->gamification->completeQuest($request->user(), 'write_note');

        return back()->with('status', 'Đã thêm lời nhắn.');
    }

    public function toggleReaction(Request $request, SharedMemory $sharedMemory): RedirectResponse
    {
        $this->ensureCanContribute($sharedMemory, $request->user()->id);
        $data = $request->validate([
            'reaction' => ['required', 'string', Rule::in(self::REACTIONS)],
        ]);
        $reaction = $sharedMemory->reactions()->firstOrCreate([
            'user_id' => $request->user()->id,
            'reaction' => $data['reaction'],
        ]);

        if (! $reaction->wasRecentlyCreated) {
            $reaction->delete();
        }

        return back();
    }

    /** @return array<int, array<string, mixed>> */
    private function acceptedFriends(User $user): array
    {
        $friendIds = Friendship::query()
            ->where('status', 'accepted')
            ->where(fn ($query) => $query->where('user_id', $user->id)->orWhere('friend_id', $user->id))
            ->get(['user_id', 'friend_id'])
            ->toBase()
            ->flatMap(fn (Friendship $friendship) => [$friendship->user_id, $friendship->friend_id])
            ->filter(fn (int $id) => $id !== $user->id)
            ->unique()
            ->values();

        return User::query()
            ->whereIn('id', $friendIds)
            ->orderBy('name')
            ->get(['id', 'name', 'username', 'avatar'])
            ->map(fn (User $friend) => $this->profileData($friend))
            ->values()
            ->all();
    }

    private function ensureAcceptedFriends(User $user, Collection $friendIds): void
    {
        $acceptedIds = collect($this->acceptedFriends($user))->pluck('id');
        $invalidIds = $friendIds->diff($acceptedIds);

        if ($invalidIds->isNotEmpty() || $friendIds->contains($user->id)) {
            throw ValidationException::withMessages(['friend_ids' => 'Chỉ có thể mời những người bạn đã kết nối.']);
        }
    }

    private function ensureCanAccess(SharedMemory $sharedMemory, int $userId): void
    {
        abort_unless($this->canAccess($sharedMemory, $userId), 403);
    }

    private function ensureCanContribute(SharedMemory $sharedMemory, int $userId): void
    {
        $this->ensureCanAccess($sharedMemory, $userId);
    }

    private function ensureOwner(SharedMemory $sharedMemory, int $userId): void
    {
        abort_unless($sharedMemory->owner_id === $userId, 403);
    }

    private function ensureInvitationOwner(SharedMemoryParticipant $participant, int $userId): void
    {
        abort_unless($participant->user_id === $userId, 403);
    }

    private function canAccess(SharedMemory $sharedMemory, int $userId): bool
    {
        return $sharedMemory->owner_id === $userId || $sharedMemory->participants()
            ->where('user_id', $userId)
            ->where('status', 'accepted')
            ->exists();
    }

    /** @return array<string, mixed> */
    private function serializeSharedMemory(SharedMemory $sharedMemory, int $viewerId): array
    {
        $acceptedParticipants = $sharedMemory->relationLoaded('participants')
            ? $sharedMemory->participants->where('status', 'accepted')->values()
            : $sharedMemory->participants()->where('status', 'accepted')->with('user')->get();
        $photos = $sharedMemory->relationLoaded('photos') ? $sharedMemory->photos : $sharedMemory->photos()->with('uploader')->get();
        $notes = $sharedMemory->relationLoaded('notes') ? $sharedMemory->notes : $sharedMemory->notes()->with('user')->get();
        $reactions = $sharedMemory->relationLoaded('reactions') ? $sharedMemory->reactions : $sharedMemory->reactions()->get();
        $disk = config('kimo.photos.disk', 'public');

        return [
            'id' => $sharedMemory->id,
            'title' => $sharedMemory->title,
            'description' => $sharedMemory->description,
            'memory_date' => $sharedMemory->memory_date?->format('Y-m-d'),
            'owner' => $this->profileData($sharedMemory->owner),
            'participants' => $acceptedParticipants->map(fn (SharedMemoryParticipant $participant) => [
                'id' => $participant->id,
                'role' => $participant->role,
                'status' => $participant->status,
                'joined_at' => $participant->joined_at?->toISOString(),
                'user' => $this->profileData($participant->user),
            ])->values(),
            'photos' => $photos->map(function (SharedMemoryPhoto $photo) use ($disk, $sharedMemory) {
                $resolve = fn (?string $p) => $p ? (str_starts_with($p, 'http') || str_starts_with($p, '/images/') ? $p : Storage::disk($disk)->url($p)) : null;
                return [
                    'id' => $photo->id,
                    'src' => $resolve($photo->thumbnail_path ?: $photo->path),
                    'originalSrc' => $resolve($photo->path),
                    'alt' => $sharedMemory->title,
                    'width' => $photo->width,
                    'height' => $photo->height,
                    'uploaded_by' => $this->profileData($photo->uploader),
                ];
            })->values(),
            'notes' => $notes->map(fn (SharedMemoryNote $note) => [
                'id' => $note->id,
                'content' => $note->content,
                'created_at' => $note->created_at?->toISOString(),
                'user' => $this->profileData($note->user),
                'is_mine' => $note->user_id === $viewerId,
            ])->values(),
            'reactions' => collect(self::REACTIONS)->map(fn (string $reaction) => [
                'reaction' => $reaction,
                'count' => $reactions->where('reaction', $reaction)->count(),
                'reacted' => $reactions->contains(fn (SharedMemoryReaction $item) => $item->reaction === $reaction && $item->user_id === $viewerId),
            ])->filter(fn (array $item) => $item['count'] > 0)->values(),
            'photo_count' => $photos->count(),
            'notes_count' => $notes->count(),
            'is_owner' => $sharedMemory->owner_id === $viewerId,
        ];
    }

    /** @return array<string, mixed> */
    private function profileData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatar,
        ];
    }

    /** @return array<string, array<int, string>> */
    private function photoRules(bool $required = true): array
    {
        $photos = ['array', 'max:'.config('kimo.memory.max_photos', 10)];

        if ($required) {
            array_unshift($photos, 'required', 'min:1');
        } else {
            array_unshift($photos, 'nullable');
        }

        return [
            'photos' => $photos,
            'photos.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:'.((int) config('kimo.photos.upload_max_size_mb', 10) * 1024),
            ],
        ];
    }

    /** @param array<int, UploadedFile> $photos */
    private function storePhotos(SharedMemory $sharedMemory, array $photos, int $userId, int $position = 0): void
    {
        foreach ($photos as $photo) {
            $stored = $this->photoStorage->store($photo, $userId);
            $sharedMemory->photos()->create([...$stored, 'uploaded_by' => $userId, 'position' => $position++]);
        }
    }

    /** @return array<int, UploadedFile> */
    private function requestPhotos(Request $request): array
    {
        $photos = $request->file('photos', []);

        return $photos instanceof UploadedFile ? [$photos] : (is_array($photos) ? $photos : []);
    }

    private function deletePhotos(SharedMemory $sharedMemory): void
    {
        foreach ($sharedMemory->photos as $photo) {
            $this->photoStorage->delete($photo->path, $photo->thumbnail_path);
        }
    }

    private function todayFor(Request $request): string
    {
        return now($request->user()->timezone ?: config('app.timezone'))->toDateString();
    }
}
