<?php

namespace App\Http\Controllers;

use App\Models\DuoStreak;
use App\Models\DuoStreakMember;
use App\Models\Friendship;
use App\Models\GroupChallenge;
use App\Models\GroupChallengeMember;
use App\Models\Memory;
use App\Models\SharedMemory;
use App\Models\SharedMemoryParticipant;
use App\Models\User;
use App\Services\AppNotificationService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FriendshipController extends Controller
{
    public function __construct(private readonly AppNotificationService $notifications) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $accepted = $this->friendshipsFor($user->id, 'accepted');
        $incoming = Friendship::query()
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user')
            ->latest()
            ->get();
        $outgoing = Friendship::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('friend')
            ->latest()
            ->get();

        $friendIds = $accepted->toBase()->map(fn (Friendship $friendship) => $this->counterparty($friendship, $user->id)->id)->values();
        $searchQuery = trim($request->string('q')->toString());
        $searchResults = collect();

        if ($searchQuery !== '') {
            $connectedIds = Friendship::query()
                ->whereIn('status', ['pending', 'accepted', 'blocked'])
                ->where(fn ($query) => $query->where('user_id', $user->id)->orWhere('friend_id', $user->id))
                ->get(['user_id', 'friend_id'])
                ->toBase()
                ->flatMap(fn (Friendship $friendship) => [$friendship->user_id, $friendship->friend_id])
                ->push($user->id)
                ->unique()
                ->values();
            $pattern = '%'.addcslashes($searchQuery, '\\%_').'%';
            $searchResults = User::query()
                ->whereNotIn('id', $connectedIds)
                ->where(fn ($query) => $query->where('name', 'like', $pattern)->orWhere('username', 'like', $pattern))
                ->latest()
                ->limit(12)
                ->get()
                ->map(fn (User $profile) => $this->profileData($profile));
        }

        $recentActivity = Memory::query()
            ->whereIn('user_id', $friendIds)
            ->where('visibility', 'public')
            ->with(['user', 'photos'])
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (Memory $memory) => $this->activityData($memory));
        $sharedMemories = SharedMemory::query()
            ->where(function ($query) use ($user): void {
                $query
                    ->where('owner_id', $user->id)
                    ->orWhereHas('participants', fn ($participantQuery) => $participantQuery
                        ->where('user_id', $user->id)
                        ->where('status', 'accepted'));
            })
            ->with(['participants.user', 'photos'])
            ->latest('memory_date')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (SharedMemory $sharedMemory) => $this->sharedMemoryData($sharedMemory))
            ->values();
        $today = CarbonImmutable::now($user->timezone ?: config('app.timezone'))->startOfDay();
        $duoStreaks = DuoStreak::query()
            ->where('status', 'active')
            ->where(function ($query) use ($user): void {
                $query
                    ->where('created_by', $user->id)
                    ->orWhereHas('members', fn ($memberQuery) => $memberQuery
                        ->where('user_id', $user->id)
                        ->where('status', 'accepted'));
            })
            ->with(['members.user', 'logs'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (DuoStreak $duoStreak) => $this->duoStreakData($duoStreak, $user->id, $today))
            ->values();
        $groupChallenges = GroupChallenge::query()
            ->where('status', 'active')
            ->where(function ($query) use ($user): void {
                $query
                    ->where('created_by', $user->id)
                    ->orWhereHas('members', fn ($memberQuery) => $memberQuery
                        ->where('user_id', $user->id)
                        ->where('status', 'accepted'));
            })
            ->with(['members.user', 'logs', 'photos'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (GroupChallenge $challenge) => $this->groupChallengeData($challenge, $user->id, $today))
            ->values();
        $challengeInvitations = GroupChallengeMember::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('groupChallenge.creator')
            ->latest()
            ->get()
            ->map(fn (GroupChallengeMember $membership) => [
                'id' => $membership->id,
                'challenge' => [
                    'id' => $membership->groupChallenge->id,
                    'name' => $membership->groupChallenge->name,
                    'goal' => $membership->groupChallenge->goal,
                    'duration' => $membership->groupChallenge->duration,
                    'invited_by' => $membership->groupChallenge->creator->name,
                ],
            ])
            ->values();

        return Inertia::render('Together/Index', [
            'profile' => $this->profileData($user),
            'friends' => $accepted->map(fn (Friendship $friendship) => $this->relationshipData($friendship, $user->id))->values(),
            'incomingRequests' => $incoming->map(fn (Friendship $friendship) => $this->relationshipData($friendship, $user->id, 'incoming'))->values(),
            'outgoingRequests' => $outgoing->map(fn (Friendship $friendship) => $this->relationshipData($friendship, $user->id, 'outgoing'))->values(),
            'searchResults' => $searchResults->values(),
            'searchQuery' => $searchQuery,
            'recentActivity' => $recentActivity->values(),
            'sharedMemories' => $sharedMemories,
            'duoStreaks' => $duoStreaks,
            'groupChallenges' => $groupChallenges,
            'challengeInvitations' => $challengeInvitations,
            'sharedStreaks' => [],
            'stats' => [
                'friends' => $accepted->count(),
                'incoming_requests' => $incoming->count(),
                'outgoing_requests' => $outgoing->count(),
            ],
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $friendId = $request->integer('friend_id');

        if ($friendId <= 0 || ! User::query()->whereKey($friendId)->exists() || $friendId === $user->id) {
            throw ValidationException::withMessages(['friend_id' => 'Không thể gửi lời mời tới tài khoản này.']);
        }

        $relation = $this->findRelation($user->id, $friendId);

        if ($relation?->status === 'blocked') {
            throw ValidationException::withMessages(['friend_id' => 'Không thể kết nối với tài khoản này.']);
        }

        if ($relation?->status === 'accepted') {
            throw ValidationException::withMessages(['friend_id' => 'Hai bạn đã là bạn bè.']);
        }

        if ($relation?->status === 'pending') {
            throw ValidationException::withMessages(['friend_id' => 'Lời mời kết bạn đang chờ xử lý.']);
        }

        if ($relation?->status === 'declined' && $relation->user_id === $user->id) {
            $relation->update(['status' => 'pending']);
        } elseif ($relation) {
            $relation->delete();
            $this->createPending($user->id, $friendId);
        } else {
            $this->createPending($user->id, $friendId);
        }

        $this->notifications->send($friendId, 'friend_request', $user->id, [
            'message' => 'đã gửi lời mời kết bạn cho bạn.',
            'url' => route('together'),
        ]);

        return to_route('together')->with('status', 'Đã gửi lời mời kết bạn.');
    }

    public function accept(Request $request, Friendship $friendship): RedirectResponse
    {
        abort_unless($friendship->friend_id === $request->user()->id && $friendship->status === 'pending', 403);
        $friendship->update(['status' => 'accepted']);
        $this->notifications->send($friendship->user_id, 'friend_accepted', $request->user()->id, [
            'message' => 'đã chấp nhận lời mời kết bạn.',
            'url' => route('together'),
        ]);

        return to_route('together')->with('status', 'Đã trở thành bạn bè.');
    }

    public function decline(Request $request, Friendship $friendship): RedirectResponse
    {
        abort_unless($friendship->friend_id === $request->user()->id && $friendship->status === 'pending', 403);
        $friendship->update(['status' => 'declined']);

        return to_route('together')->with('status', 'Đã từ chối lời mời.');
    }

    public function destroy(Request $request, Friendship $friendship): RedirectResponse
    {
        $this->ensureParticipant($request, $friendship);
        abort_unless($friendship->status === 'accepted' || ($friendship->status === 'pending' && $friendship->user_id === $request->user()->id), 403);
        $friendship->delete();

        return to_route('together')->with('status', 'Đã cập nhật danh sách bạn bè.');
    }

    public function block(Request $request, Friendship $friendship): RedirectResponse
    {
        $this->ensureParticipant($request, $friendship);
        $friendship->update(['status' => 'blocked']);

        return to_route('together')->with('status', 'Đã chặn tài khoản này.');
    }

    /** @return Collection<int, Friendship> */
    private function friendshipsFor(int $userId, string $status): Collection
    {
        return Friendship::query()
            ->where('status', $status)
            ->where(fn ($query) => $query->where('user_id', $userId)->orWhere('friend_id', $userId))
            ->with(['user', 'friend'])
            ->latest('updated_at')
            ->get();
    }

    private function findRelation(int $userId, int $friendId): ?Friendship
    {
        return Friendship::query()
            ->where(fn ($query) => $query
                ->where(fn ($query) => $query->where('user_id', $userId)->where('friend_id', $friendId))
                ->orWhere(fn ($query) => $query->where('user_id', $friendId)->where('friend_id', $userId)))
            ->first();
    }

    private function createPending(int $userId, int $friendId): Friendship
    {
        return Friendship::query()->create(['user_id' => $userId, 'friend_id' => $friendId, 'status' => 'pending']);
    }

    private function ensureParticipant(Request $request, Friendship $friendship): void
    {
        abort_unless($friendship->user_id === $request->user()->id || $friendship->friend_id === $request->user()->id, 403);
    }

    private function counterparty(Friendship $friendship, int $userId): User
    {
        return $friendship->user_id === $userId ? $friendship->friend : $friendship->user;
    }

    /** @return array<string, mixed> */
    private function relationshipData(Friendship $friendship, int $userId, ?string $direction = null): array
    {
        return [
            'id' => $friendship->id,
            'status' => $friendship->status,
            'direction' => $direction ?? ($friendship->user_id === $userId ? 'outgoing' : 'incoming'),
            'user' => $this->profileData($this->counterparty($friendship, $userId)),
        ];
    }

    /** @return array<string, mixed> */
    private function profileData(User $profile): array
    {
        return [
            'id' => $profile->id,
            'name' => $profile->name,
            'username' => $profile->username,
            'avatar' => $profile->avatar,
            'bio' => $profile->bio,
            'memory_count' => $profile->memories()->count(),
            'streak_count' => $profile->streaks()->where('active', true)->count(),
            'friends_count' => $this->friendCount($profile->id),
        ];
    }

    private function friendCount(int $userId): int
    {
        return Friendship::query()
            ->where('status', 'accepted')
            ->where(fn ($query) => $query->where('user_id', $userId)->orWhere('friend_id', $userId))
            ->count();
    }

    /** @return array<string, mixed> */
    private function activityData(Memory $memory): array
    {
        $actor = $memory->user;
        $photo = $memory->photos->first();
        $photoPath = $photo?->thumbnail_path ?: $photo?->path;
        $photoUrl = $photoPath ? Storage::disk(config('kimo.photos.disk', 'public'))->url($photoPath) : null;

        if ($photoUrl && config('kimo.photos.disk', 'public') === 'public') {
            $photoUrl = parse_url($photoUrl, PHP_URL_PATH) ?: $photoUrl;
        }

        return [
            'id' => $memory->id,
            'type' => 'memory',
            'actor' => [
                'id' => $actor->id,
                'name' => $actor->name,
                'username' => $actor->username,
                'avatar' => $actor->avatar,
            ],
            'description' => ($actor && request()->user() && $actor->id === request()->user()->id) ? 'Bạn đã thêm một khoảnh khắc.' : (($actor?->name ?? 'Người dùng').' đã thêm một khoảnh khắc.'),
            'memory_id' => $memory->id,
            'photo_url' => $photoUrl,
            'created_at' => $memory->created_at?->toISOString(),
        ];
    }

    /** @return array<string, mixed> */
    private function sharedMemoryData(SharedMemory $sharedMemory): array
    {
        return [
            'id' => $sharedMemory->id,
            'title' => $sharedMemory->title,
            'memory_date' => $sharedMemory->memory_date?->format('Y-m-d'),
            'photo_count' => $sharedMemory->photos->count(),
            'participants' => $sharedMemory->participants
                ->where('status', 'accepted')
                ->map(fn (SharedMemoryParticipant $participant) => [
                    'id' => $participant->user->id,
                    'name' => $participant->user->name,
                    'avatar' => $participant->user->avatar,
                ])
                ->values(),
        ];
    }

    /** @return array<string, mixed> */
    private function duoStreakData(DuoStreak $duoStreak, int $userId, CarbonImmutable $today): array
    {
        $todayDate = $today->toDateString();
        $members = $duoStreak->members->where('status', 'accepted')->values();
        $todayLogs = $duoStreak->logs
            ->where('completed', true)
            ->filter(fn ($log) => $log->date->toDateString() === $todayDate)
            ->pluck('user_id');
        $otherMember = $members->first(fn (DuoStreakMember $member) => $member->user_id !== $userId);

        return [
            'id' => $duoStreak->id,
            'name' => $duoStreak->name,
            'frequency' => $duoStreak->frequency,
            'start_date' => $duoStreak->start_date?->format('Y-m-d') ?? '',
            'current_streak' => $duoStreak->current_streak,
            'best_streak' => $duoStreak->best_streak,
            'status' => $duoStreak->status,
            'is_owner' => $duoStreak->created_by === $userId,
            'can_check_in' => $members->contains(fn (DuoStreakMember $member) => $member->user_id === $userId) && ! $todayLogs->contains($userId),
            'all_completed_today' => $members->isNotEmpty() && $members->every(fn (DuoStreakMember $member) => $todayLogs->contains($member->user_id)),
            'other_member_id' => $otherMember?->user_id,
            'members' => $members->map(fn (DuoStreakMember $member) => [
                'id' => $member->user_id,
                'name' => $member->user->name,
                'avatar' => $member->user->avatar,
                'completed_today' => $todayLogs->contains($member->user_id),
            ])->values(),
        ];
    }

    /** @return array<string, mixed> */
    private function groupChallengeData(GroupChallenge $challenge, int $userId, CarbonImmutable $today): array
    {
        $todayDate = $today->toDateString();
        $members = $challenge->members->where('status', 'accepted')->values();
        $logs = $challenge->logs->where('completed', true);
        $photos = $challenge->photos;
        $startDate = $challenge->start_date?->toDateString() ?? '';
        $endDate = $challenge->end_date?->toDateString() ?? '';
        $todayInRange = $startDate !== '' && $endDate !== '' && $todayDate >= $startDate && $todayDate <= $endDate;

        return [
            'id' => $challenge->id,
            'name' => $challenge->name,
            'goal' => $challenge->goal,
            'duration' => $challenge->duration,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $challenge->status,
            'is_owner' => $challenge->created_by === $userId,
            'remaining_days' => $todayInRange ? $today->diffInDays(CarbonImmutable::parse($endDate, $today->timezone)) + 1 : 0,
            'members' => $members->map(function (GroupChallengeMember $member) use ($logs, $photos, $todayDate, $challenge): array {
                $progress = $logs
                    ->filter(fn ($log) => $log->user_id === $member->user_id && $log->date->toDateString() >= $challenge->start_date->toDateString() && $log->date->toDateString() <= $challenge->end_date->toDateString())
                    ->count();

                return [
                    'id' => $member->user_id,
                    'name' => $member->user->name,
                    'avatar' => $member->user->avatar,
                    'progress' => $progress,
                    'progress_percent' => min(100, (int) round(($progress / max(1, $challenge->goal)) * 100)),
                    'photo_count' => $photos->where('user_id', $member->user_id)->count(),
                    'today_completed' => $logs->contains(fn ($log) => $log->user_id === $member->user_id && $log->date->toDateString() === $todayDate),
                ];
            })->values(),
            'can_check_in' => $todayInRange && $members->contains(fn (GroupChallengeMember $member) => $member->user_id === $userId) && ! $logs->contains(fn ($log) => $log->user_id === $userId && $log->date->toDateString() === $todayDate),
        ];
    }
}
