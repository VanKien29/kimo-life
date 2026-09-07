<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemoryStoreRequest;
use App\Http\Requests\MemoryUpdateRequest;
use App\Models\Friendship;
use App\Models\Memory;
use App\Models\MemoryComment;
use App\Models\MemoryReaction;
use App\Services\GamificationService;
use App\Services\MemoryPhotoStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class MemoryController extends Controller
{
    public function __construct(
        private readonly MemoryPhotoStorage $photoStorage,
        private readonly GamificationService $gamification,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Memory/Index', $this->pageProps(
            $request,
            $request->boolean('compose'),
            null,
            $request->boolean('advanced'),
        ));
    }

    public function show(Request $request, Memory $memory): Response
    {
        $this->authorize('view', $memory);

        $memory->load(['user', 'photos', 'activities', 'tags', 'reactions', 'comments.user']);
        $user = $request->user();
        $friendIds = Friendship::query()
            ->where('status', 'accepted')
            ->where(fn ($query) => $query->where('user_id', $user->id)->orWhere('friend_id', $user->id))
            ->get(['user_id', 'friend_id'])
            ->flatMap(fn (Friendship $friendship) => [$friendship->user_id, $friendship->friend_id])
            ->reject(fn (int $id) => $id === $user->id)
            ->unique()
            ->values();
        $feed = Memory::query()
            ->where(function ($query) use ($user, $friendIds): void {
                $query->where('user_id', $user->id)
                    ->orWhere('visibility', 'public');

                if ($friendIds->isNotEmpty()) {
                    $query->orWhere(fn ($friendsQuery) => $friendsQuery->where('visibility', 'friends')->whereIn('user_id', $friendIds));
                }
            })
            ->with(['user', 'photos', 'activities', 'tags'])
            ->latest('memory_date')
            ->latest('id')
            ->get()
            ->map(fn (Memory $item) => $this->serializeMemory($request, $item))
            ->values();

        return Inertia::render('Memory/Show', [
            'memory' => $this->serializeMemory($request, $memory, true),
            'feed' => $feed,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function edit(Request $request, Memory $memory): Response
    {
        $this->authorize('update', $memory);

        return Inertia::render('Memory/Index', $this->pageProps(
            $request,
            true,
            $memory->load(['photos', 'activities', 'tags']),
            true,
        ));
    }

    public function store(MemoryStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $attributes = $this->memoryAttributes($data);
        $attributes['memory_date'] = $this->todayFor($request);
        $memory = $request->user()->memories()->create($attributes);

        try {
            $this->storePhotos($memory, $this->requestPhotos($request), $request->user()->id);
            $this->syncAssociations($memory, $data);
        } catch (Throwable $exception) {
            $memory->delete();
            report($exception);
            throw $exception;
        }

        $this->gamification->completeQuest($request->user(), 'save_memory');

        return to_route('memory.index')->with('status', 'Đã lưu khoảnh khắc 🌱');
    }

    public function update(MemoryUpdateRequest $request, Memory $memory): RedirectResponse
    {
        $this->authorize('update', $memory);

        $data = $request->validated();
        $memory->update($this->memoryAttributes($data));

        $removePhotoIds = $data['remove_photo_ids'] ?? [];
        $newPhotos = $this->requestPhotos($request);
        $maxPhotos = (int) config('kimo.memory.max_photos', 10);
        $currentPhotoCount = $memory->photos()->count();
        $removedPhotoCount = $memory->photos()->whereIn('id', $removePhotoIds)->count();

        if ($currentPhotoCount - $removedPhotoCount + count($newPhotos) > $maxPhotos) {
            throw ValidationException::withMessages([
                'photos' => "Một khoảnh khắc chỉ có thể có tối đa {$maxPhotos} ảnh.",
            ]);
        }

        $this->removePhotos($memory, $removePhotoIds);
        $this->storePhotos($memory, $newPhotos, $request->user()->id, $currentPhotoCount - $removedPhotoCount);
        $this->syncAssociations($memory, $data);

        return to_route('memory.show', $memory)->with('status', 'Đã cập nhật khoảnh khắc.');
    }

    public function destroy(Request $request, Memory $memory): RedirectResponse
    {
        $this->authorize('delete', $memory);

        $memory->load('photos');

        foreach ($memory->photos as $photo) {
            $this->photoStorage->delete($photo->path, $photo->thumbnail_path);
        }

        $memory->delete();

        return to_route('memory.index')->with('status', 'Đã chuyển khoảnh khắc vào thùng rác.');
    }

    public function favorite(Request $request, Memory $memory): RedirectResponse
    {
        $this->authorize('favorite', $memory);

        $favorite = $memory->favorites()->firstOrCreate(['user_id' => $request->user()->id]);

        if (! $favorite->wasRecentlyCreated) {
            $favorite->delete();
        }

        return back();
    }

    /** @return array<string, mixed> */
    private function pageProps(Request $request, bool $openComposer = false, ?Memory $editingMemory = null, bool $advanced = false): array
    {
        $filters = $this->searchFilters($request);
        $memoryQuery = $request->user()->memories()
            ->with(['photos', 'activities', 'tags'])
            ->latest('memory_date')
            ->latest();

        if ($filters['q'] !== '') {
            $pattern = $this->likePattern($filters['q']);
            $memoryQuery->where(function ($query) use ($pattern): void {
                $query
                    ->where('title', 'like', $pattern)
                    ->orWhere('content', 'like', $pattern)
                    ->orWhereHas('tags', fn ($tagQuery) => $tagQuery->where('name', 'like', $pattern))
                    ->orWhereHas('activities', fn ($activityQuery) => $activityQuery->where('name', 'like', $pattern));
            });
        }

        if ($filters['date_from']) {
            $memoryQuery->whereDate('memory_date', '>=', $filters['date_from']);
        }

        if ($filters['date_to']) {
            $memoryQuery->whereDate('memory_date', '<=', $filters['date_to']);
        }

        if ($filters['activity_id']) {
            $memoryQuery->whereHas('activities', fn ($activityQuery) => $activityQuery->where('activities.id', $filters['activity_id']));
        }

        if ($filters['mood'] !== '') {
            $memoryQuery->where('mood', $filters['mood']);
        }

        if ($filters['tag'] !== '') {
            $memoryQuery->whereHas('tags', fn ($tagQuery) => $tagQuery->where('name', $filters['tag']));
        }

        if ($filters['location'] !== '') {
            $memoryQuery->where('location', 'like', $this->likePattern($filters['location']));
        }

        $memories = $memoryQuery
            ->paginate($filters['is_searching'] ? config('kimo.search.page_size', 20) : config('kimo.pagination.default', 20))
            ->withQueryString()
            ->through(fn (Memory $memory) => $this->serializeMemory($request, $memory));

        return [
            'memories' => $memories,
            'today' => $this->todayFor($request),
            'activities' => $request->user()->activities()->whereNull('archived_at')->latest()->limit(20)->get(['id', 'name', 'icon', 'color'])->map(fn ($activity) => [
                'id' => $activity->id,
                'name' => $activity->name,
                'icon' => $activity->icon,
                'color' => $activity->color,
            ])->values(),
            'tags' => $request->user()->tags()->latest()->limit(30)->pluck('name')->values(),
            'search' => [
                ...$filters,
                'result_count' => $memories->total(),
            ],
            'status' => $request->session()->get('status'),
            'composer' => [
                'open' => $openComposer,
                'advanced' => $advanced,
                'memory' => $editingMemory ? $this->serializeMemory($request, $editingMemory) : null,
            ],
        ];
    }

    /** @return array{q: string, date_from: ?string, date_to: ?string, activity_id: ?int, mood: string, tag: string, location: string, is_searching: bool} */
    private function searchFilters(Request $request): array
    {
        $query = trim($request->string('q')->toString());
        $dateFrom = $this->validSearchDate($request->input('date_from'));
        $dateTo = $this->validSearchDate($request->input('date_to'));
        $activityId = $request->integer('activity_id');
        $activityId = $activityId > 0 ? $activityId : null;
        $mood = trim($request->string('mood')->toString());
        $tag = trim(ltrim($request->string('tag')->toString(), '#'));
        $location = trim($request->string('location')->toString());

        return [
            'q' => $query,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'activity_id' => $activityId,
            'mood' => $mood,
            'tag' => $tag,
            'location' => $location,
            'is_searching' => $query !== '' || $dateFrom !== null || $dateTo !== null || $activityId !== null || $mood !== '' || $tag !== '' || $location !== '',
        ];
    }

    private function validSearchDate(mixed $value): ?string
    {
        $date = is_string($value) ? trim($value) : '';

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1 ? $date : null;
    }

    private function likePattern(string $value): string
    {
        return '%'.addcslashes($value, '\\%_').'%';
    }

    /** @param array<string, mixed> $data */
    private function memoryAttributes(array $data): array
    {
        return collect($data)->only(['title', 'content', 'mood', 'visibility', 'location'])->all();
    }

    private function todayFor(Request $request): string
    {
        return now($request->user()->timezone ?: config('app.timezone'))->toDateString();
    }

    /** @param array<int, UploadedFile> $photos */
    private function storePhotos(Memory $memory, array $photos, int $userId, int $position = 0): void
    {
        foreach ($photos as $photo) {
            $stored = $this->photoStorage->store($photo, $userId);
            $memory->photos()->create([...$stored, 'position' => $position++]);
        }
    }

    /** @return array<int, UploadedFile> */
    private function requestPhotos(Request $request): array
    {
        $photos = $request->file('photos', []);

        return $photos instanceof UploadedFile ? [$photos] : (is_array($photos) ? $photos : []);
    }

    /** @param array<int, int|string> $photoIds */
    private function removePhotos(Memory $memory, array $photoIds): void
    {
        if ($photoIds === []) {
            return;
        }

        $photos = $memory->photos()->whereIn('id', $photoIds)->get();

        foreach ($photos as $photo) {
            $this->photoStorage->delete($photo->path, $photo->thumbnail_path);
            $photo->delete();
        }

        $memory->photos()->get()->each(fn ($photo, $index) => $photo->update(['position' => $index]));
    }

    /** @param array<string, mixed> $data */
    private function syncAssociations(Memory $memory, array $data): void
    {
        $activities = $this->uniqueNames($data['activities'] ?? []);
        $activityIds = collect($activities)->map(fn (string $name) => $memory->user->activities()->firstOrCreate(
            ['name' => $name],
            ['icon' => 'sparkles', 'color' => 'green'],
        )->id)->all();

        $tags = $this->uniqueNames($data['tags'] ?? []);
        $tagIds = collect($tags)->map(fn (string $name) => $memory->user->tags()->firstOrCreate(['name' => $name])->id)->all();

        $memory->activities()->sync($activityIds);
        $memory->tags()->sync($tagIds);
    }

    /** @param array<int, mixed> $names */
    private function uniqueNames(array $names): array
    {
        return collect($names)
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->unique(fn (string $name) => mb_strtolower($name))
            ->values()
            ->all();
    }

    /** @return array<string, mixed> */
    private function serializeMemory(Request $request, Memory $memory, bool $includeInteractions = false): array
    {
        $disk = config('kimo.photos.disk', 'public');
        $timezone = $request->user()->timezone ?: config('app.timezone');

        $serialized = [
            'id' => $memory->id,
            'title' => $memory->title,
            'content' => $memory->content,
            'memory_date' => $memory->memory_date?->format('Y-m-d'),
            'mood' => $memory->mood,
            'visibility' => $memory->visibility,
            'location' => $memory->location,
            'created_at' => $memory->created_at?->setTimezone($timezone)->toIso8601String(),
            'time_label' => $memory->created_at?->setTimezone($timezone)->format('H:i'),
            'owner' => $memory->relationLoaded('user') && $memory->user ? [
                'id' => $memory->user->id,
                'name' => $memory->user->name,
                'username' => $memory->user->username,
                'avatar' => $memory->user->avatar,
            ] : null,
            'photos' => $memory->photos->map(function ($photo) use ($disk, $memory) {
                $resolve = function (?string $p) use ($disk): ?string {
                    if (! $p) {
                        return null;
                    }

                    if (str_starts_with($p, 'http')) {
                        return parse_url($p, PHP_URL_PATH) ?: $p;
                    }

                    if (str_starts_with($p, '/images/')) {
                        return $p;
                    }

                    if ($disk === 'public') {
                        return '/storage/'.ltrim($p, '/');
                    }

                    return Storage::disk($disk)->url($p);
                };
                return [
                    'id' => $photo->id,
                    'src' => $resolve($photo->thumbnail_path ?: $photo->path),
                    'originalSrc' => $resolve($photo->path),
                    'alt' => $memory->title ?: 'Ảnh trong khoảnh khắc',
                    'width' => $photo->width,
                    'height' => $photo->height,
                ];
            })->values(),
            'activities' => $memory->activities->map(fn ($activity) => [
                'id' => $activity->id,
                'name' => $activity->name,
                'icon' => $activity->icon,
                'color' => $activity->color,
            ])->values(),
            'tags' => $memory->tags->pluck('name')->values(),
            'is_favorite' => $memory->favorites()->where('user_id', $request->user()->id)->exists(),
        ];

        if ($includeInteractions) {
            $reactions = $memory->relationLoaded('reactions') ? $memory->reactions : $memory->reactions()->get();
            $comments = $memory->relationLoaded('comments') ? $memory->comments : $memory->comments()->with('user')->latest()->get();
            $serialized['reactions'] = collect(['❤️', '🔥', '👏', '✨', '😂', '🥹'])->map(fn (string $reaction) => [
                'reaction' => $reaction,
                'count' => $reactions->where('reaction', $reaction)->count(),
                'reacted' => $reactions->contains(fn (MemoryReaction $item) => $item->reaction === $reaction && $item->user_id === $request->user()->id),
            ])->values();
            $serialized['comments'] = $comments->map(fn (MemoryComment $comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'created_at' => $comment->created_at?->toISOString(),
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                    'username' => $comment->user->username,
                    'avatar' => $comment->user->avatar,
                ],
                'is_mine' => $comment->user_id === $request->user()->id,
            ])->values();
        }

        return $serialized;
    }
}
