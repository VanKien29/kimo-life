<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\GroupChallenge;
use App\Models\GroupChallengeLog;
use App\Models\GroupChallengeMember;
use App\Models\GroupChallengePhoto;
use App\Services\AppNotificationService;
use App\Services\GamificationService;
use App\Services\MemoryPhotoStorage;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GroupChallengeController extends Controller
{
    public function __construct(
        private readonly AppNotificationService $notifications,
        private readonly GamificationService $gamification,
        private readonly MemoryPhotoStorage $photoStorage,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'goal' => ['required', 'integer', 'min:1', 'max:365'],
            'duration' => ['required', 'integer', 'min:1', 'max:365'],
            'friend_ids' => ['nullable', 'array', 'max:20'],
            'friend_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ]);
        $user = $request->user();
        $friendIds = collect($data['friend_ids'] ?? [])->map(fn ($id) => (int) $id)->unique()->values();
        $acceptedIds = $this->acceptedFriendIds($user->id);

        if ($friendIds->diff($acceptedIds)->isNotEmpty() || $friendIds->contains($user->id)) {
            throw ValidationException::withMessages(['friend_ids' => 'Chỉ có thể thêm những người bạn đã kết nối.']);
        }

        $today = CarbonImmutable::now($user->timezone ?: config('app.timezone'))->startOfDay();
        $duration = (int) $data['duration'];
        DB::transaction(function () use ($data, $friendIds, $today, $duration, $user): void {
            $challenge = GroupChallenge::query()->create([
                'name' => trim($data['name']),
                'goal' => (int) $data['goal'],
                'duration' => $duration,
                'start_date' => $today->toDateString(),
                'end_date' => $today->addDays($duration - 1)->toDateString(),
                'created_by' => $user->id,
                'status' => 'active',
            ]);
            $challenge->members()->create([
                'user_id' => $user->id,
                'role' => 'owner',
                'status' => 'accepted',
            ]);

            foreach ($friendIds as $friendId) {
                $challenge->members()->create([
                    'user_id' => $friendId,
                    'role' => 'member',
                    'status' => 'pending',
                ]);

                $this->notifications->send($friendId, 'challenge', $user->id, [
                    'message' => 'đã mời bạn tham gia thử thách nhóm.',
                    'url' => route('together'),
                ]);
            }
        });

        return to_route('together')->with('status', 'Đã tạo thử thách nhóm.');
    }

    public function checkIn(Request $request, GroupChallenge $groupChallenge): RedirectResponse
    {
        $this->ensureMember($groupChallenge, $request->user()->id);
        abort_if($groupChallenge->status !== 'active', 404);
        $data = $request->validate([
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ]);
        $today = CarbonImmutable::now($request->user()->timezone ?: config('app.timezone'))->startOfDay();
        $start = CarbonImmutable::parse($groupChallenge->start_date->toDateString(), $today->timezone);
        $end = CarbonImmutable::parse($groupChallenge->end_date->toDateString(), $today->timezone);

        if ($today->lessThan($start) || $today->greaterThan($end)) {
            throw ValidationException::withMessages(['check_in' => 'Hôm nay không nằm trong thời gian của thử thách.']);
        }

        $alreadyCompleted = $groupChallenge->logs()
            ->where('user_id', $request->user()->id)
            ->whereDate('date', $today->toDateString())
            ->where('completed', true)
            ->exists();
        $log = $groupChallenge->logs()->updateOrCreate(
            ['user_id' => $request->user()->id, 'date' => $today->toDateString()],
            ['completed' => true],
        );
        $this->persistPhotos($groupChallenge, $log, $request->user()->id, $data['photos'] ?? []);
        $this->gamification->completeQuest($request->user(), 'check_in_friend', $today);

        if (! $alreadyCompleted) {
            $groupChallenge->members()->where('user_id', '!=', $request->user()->id)->where('status', 'accepted')->pluck('user_id')->each(
                fn (int $memberId) => $this->notifications->send($memberId, 'challenge', $request->user()->id, [
                    'message' => 'đã check-in cho thử thách nhóm.',
                    'url' => route('together'),
                ]),
            );
        }

        return back()->with('status', $alreadyCompleted ? 'Bạn đã check-in hôm nay rồi.' : 'Đã check-in cho thử thách 🌱');
    }

    public function show(Request $request, GroupChallenge $groupChallenge): Response
    {
        $user = $request->user();
        $this->ensureMember($groupChallenge, $user->id);
        $groupChallenge->load(['members.user', 'logs', 'photos.user']);

        return Inertia::render('Together/Challenge', [
            'challenge' => $this->challengeDetailData($groupChallenge, $user->id),
            'status' => session('status'),
        ]);
    }

    public function storePhotos(Request $request, GroupChallenge $groupChallenge): RedirectResponse
    {
        $user = $request->user();
        $this->ensureMember($groupChallenge, $user->id);
        abort_if($groupChallenge->status !== 'active', 404);
        $data = $request->validate([
            'photos' => ['required', 'array', 'min:1', 'max:6'],
            'photos.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ]);
        $today = CarbonImmutable::now($user->timezone ?: config('app.timezone'))->startOfDay();
        $this->ensureDateInRange($groupChallenge, $today);
        $log = $groupChallenge->logs()->updateOrCreate(
            ['user_id' => $user->id, 'date' => $today->toDateString()],
            ['completed' => true],
        );
        $this->persistPhotos($groupChallenge, $log, $user->id, $data['photos']);

        return back()->with('status', 'Đã thêm ảnh vào thử thách.');
    }

    public function acceptInvitation(Request $request, GroupChallengeMember $groupChallengeMember): RedirectResponse
    {
        abort_unless($groupChallengeMember->user_id === $request->user()->id && $groupChallengeMember->status === 'pending', 403);
        $groupChallengeMember->update(['status' => 'accepted']);

        return to_route('together')->with('status', 'Bạn đã tham gia thử thách.');
    }

    public function declineInvitation(Request $request, GroupChallengeMember $groupChallengeMember): RedirectResponse
    {
        abort_unless($groupChallengeMember->user_id === $request->user()->id && $groupChallengeMember->status === 'pending', 403);
        $groupChallengeMember->update(['status' => 'declined']);

        return to_route('together')->with('status', 'Đã từ chối lời mời thử thách.');
    }

    public function destroy(Request $request, GroupChallenge $groupChallenge): RedirectResponse
    {
        abort_unless($groupChallenge->created_by === $request->user()->id, 403);
        $groupChallenge->load('photos');

        foreach ($groupChallenge->photos as $photo) {
            $this->photoStorage->delete($photo->path, $photo->thumbnail_path);
        }

        $groupChallenge->delete();

        return to_route('together')->with('status', 'Đã xóa thử thách.');
    }

    /** @return Collection<int, int> */
    private function acceptedFriendIds(int $userId): Collection
    {
        return Friendship::query()
            ->where('status', 'accepted')
            ->where(fn ($query) => $query->where('user_id', $userId)->orWhere('friend_id', $userId))
            ->get(['user_id', 'friend_id'])
            ->toBase()
            ->flatMap(fn (Friendship $friendship) => [$friendship->user_id, $friendship->friend_id])
            ->reject(fn (int $id) => $id === $userId)
            ->unique()
            ->values();
    }

    private function ensureMember(GroupChallenge $groupChallenge, int $userId): void
    {
        abort_unless($groupChallenge->members()->where('user_id', $userId)->where('status', 'accepted')->exists(), 403);
    }

    /** @param array<int, mixed> $photos */
    private function persistPhotos(GroupChallenge $challenge, GroupChallengeLog $log, int $userId, array $photos): void
    {
        foreach ($photos as $index => $photo) {
            $stored = $this->photoStorage->store($photo, $userId);
            $challenge->photos()->create([
                'group_challenge_log_id' => $log->id,
                'user_id' => $userId,
                'date' => $log->date->toDateString(),
                'path' => $stored['path'],
                'thumbnail_path' => $stored['thumbnail_path'],
                'width' => $stored['width'],
                'height' => $stored['height'],
                'position' => $index,
            ]);
        }
    }

    private function ensureDateInRange(GroupChallenge $challenge, CarbonImmutable $date): void
    {
        $start = CarbonImmutable::parse($challenge->start_date->toDateString(), $date->timezone);
        $end = CarbonImmutable::parse($challenge->end_date->toDateString(), $date->timezone);

        if ($date->lessThan($start) || $date->greaterThan($end)) {
            throw ValidationException::withMessages(['photos' => 'Hôm nay không nằm trong thời gian của thử thách.']);
        }
    }

    /** @return array<string, mixed> */
    private function challengeDetailData(GroupChallenge $challenge, int $userId): array
    {
        $logs = $challenge->logs->where('completed', true);
        $photos = $challenge->photos->sortBy([['date', 'desc'], ['position', 'asc']]);

        return [
            'id' => $challenge->id,
            'name' => $challenge->name,
            'goal' => $challenge->goal,
            'duration' => $challenge->duration,
            'start_date' => $challenge->start_date?->toDateString(),
            'end_date' => $challenge->end_date?->toDateString(),
            'status' => $challenge->status,
            'is_owner' => $challenge->created_by === $userId,
            'current_user_id' => $userId,
            'can_add_photos' => $challenge->status === 'active',
            'members' => $challenge->members->where('status', 'accepted')->map(function ($member) use ($logs, $photos, $challenge): array {
                $progress = $logs->where('user_id', $member->user_id)->filter(fn ($log) => $log->date->betweenIncluded($challenge->start_date, $challenge->end_date))->count();

                return [
                    'id' => $member->user_id,
                    'name' => $member->user->name,
                    'username' => $member->user->username,
                    'avatar' => $member->user->avatar,
                    'progress' => $progress,
                    'progress_percent' => min(100, (int) round(($progress / max(1, $challenge->goal)) * 100)),
                    'photo_count' => $photos->where('user_id', $member->user_id)->count(),
                ];
            })->values(),
            'photos' => $photos->map(fn (GroupChallengePhoto $photo) => [
                'id' => $photo->id,
                'user_id' => $photo->user_id,
                'user_name' => $photo->user->name,
                'user_avatar' => $photo->user->avatar,
                'date' => $photo->date?->toDateString(),
                'src' => $this->photoUrl($photo->thumbnail_path ?: $photo->path),
                'original_src' => $this->photoUrl($photo->path),
                'width' => $photo->width,
                'height' => $photo->height,
            ])->values(),
        ];
    }

    private function photoUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        if (str_starts_with($path, '/images/') || str_starts_with($path, 'http')) {
            return str_starts_with($path, 'http') ? (parse_url($path, PHP_URL_PATH) ?: $path) : $path;
        }
        if (config('kimo.photos.disk', 'public') === 'public') {
            return '/storage/'.ltrim($path, '/');
        }

        return Storage::disk(config('kimo.photos.disk', 'public'))->url($path);
    }
}
