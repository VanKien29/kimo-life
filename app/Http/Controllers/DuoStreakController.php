<?php

namespace App\Http\Controllers;

use App\Models\DuoStreak;
use App\Models\DuoStreakMember;
use App\Models\Friendship;
use App\Services\AppNotificationService;
use App\Services\GamificationService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DuoStreakController extends Controller
{
    public function __construct(
        private readonly AppNotificationService $notifications,
        private readonly GamificationService $gamification,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'friend_id' => ['required', 'integer', 'exists:users,id'],
            'frequency' => ['nullable', 'string', Rule::in(['daily'])],
        ]);
        $user = $request->user();
        $friendId = (int) $data['friend_id'];

        if ($friendId === $user->id || ! $this->areAcceptedFriends($user->id, $friendId)) {
            throw ValidationException::withMessages(['friend_id' => 'Chỉ có thể chọn một người bạn đã kết nối.']);
        }

        $today = $this->todayFor($request);
        DB::transaction(function () use ($data, $friendId, $today, $user): void {
            $duoStreak = DuoStreak::query()->create([
                'name' => trim($data['name']),
                'activity_id' => null,
                'created_by' => $user->id,
                'frequency' => $data['frequency'] ?? 'daily',
                'start_date' => $today->toDateString(),
                'status' => 'active',
            ]);
            $duoStreak->members()->createMany([
                ['user_id' => $user->id, 'role' => 'owner', 'status' => 'accepted'],
                ['user_id' => $friendId, 'role' => 'member', 'status' => 'accepted'],
            ]);
        });
        $this->gamification->syncAchievements($user);

        return to_route('together')->with('status', 'Đã tạo chuỗi chung.');
    }

    public function checkIn(Request $request, DuoStreak $duoStreak): RedirectResponse
    {
        $this->ensureMember($duoStreak, $request->user()->id);
        abort_if($duoStreak->status !== 'active', 404);
        $today = $this->todayFor($request);

        if ($today->lessThan(CarbonImmutable::parse($duoStreak->start_date->toDateString(), $today->timezone))) {
            throw ValidationException::withMessages(['check_in' => 'Chuỗi chung này chưa bắt đầu.']);
        }

        $alreadyCompleted = $duoStreak->logs()
            ->where('user_id', $request->user()->id)
            ->whereDate('date', $today->toDateString())
            ->where('completed', true)
            ->exists();
        $duoStreak->logs()->updateOrCreate(
            ['user_id' => $request->user()->id, 'date' => $today->toDateString()],
            ['completed' => true],
        );
        $this->recalculate($duoStreak, $today);
        $this->gamification->completeQuest($request->user(), 'check_in_friend', $today);

        if (! $alreadyCompleted) {
            $duoStreak->members()->where('user_id', '!=', $request->user()->id)->where('status', 'accepted')->pluck('user_id')->each(
                fn (int $memberId) => $this->notifications->send($memberId, 'duo_streak', $request->user()->id, [
                    'message' => 'đã check-in cho chuỗi chung.',
                    'url' => route('together'),
                ]),
            );
        }

        return back()->with('status', $alreadyCompleted ? 'Bạn đã check-in hôm nay rồi.' : 'Đã check-in cho chuỗi chung 🔥');
    }

    public function remind(Request $request, DuoStreak $duoStreak): RedirectResponse
    {
        $this->ensureMember($duoStreak, $request->user()->id);
        abort_if($duoStreak->status !== 'active', 404);
        $data = $request->validate(['to_user_id' => ['required', 'integer', 'exists:users,id']]);
        $toUserId = (int) $data['to_user_id'];
        $validTarget = $duoStreak->members()
            ->where('user_id', $toUserId)
            ->where('status', 'accepted')
            ->exists();

        if (! $validTarget || $toUserId === $request->user()->id) {
            throw ValidationException::withMessages(['to_user_id' => 'Không thể nhắc người này.']);
        }

        $today = $this->todayFor($request);
        $reminderData = [
            'from_user_id' => $request->user()->id,
            'to_user_id' => $toUserId,
            'date' => $today->toDateString(),
        ];
        $created = DB::table('duo_streak_reminders')->insertOrIgnore([
            'duo_streak_id' => $duoStreak->id,
            ...$reminderData,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $alreadySent = $created === 0;

        if (! $alreadySent) {
            $this->notifications->send($toUserId, 'reminder', $request->user()->id, [
                'message' => 'đã nhắc bạn check-in chuỗi chung hôm nay.',
                'url' => route('together'),
            ]);
        }

        return back()->with('status', $alreadySent ? 'Bạn đã gửi lời nhắc hôm nay rồi.' : 'Đã nhắc bạn check-in hôm nay.');
    }

    public function deactivate(Request $request, DuoStreak $duoStreak): RedirectResponse
    {
        abort_unless($duoStreak->created_by === $request->user()->id, 403);
        $duoStreak->update(['status' => 'paused']);

        return to_route('together')->with('status', 'Đã tạm dừng chuỗi chung.');
    }

    private function areAcceptedFriends(int $userId, int $friendId): bool
    {
        return Friendship::query()
            ->where('status', 'accepted')
            ->where(fn ($query) => $query
                ->where(fn ($query) => $query->where('user_id', $userId)->where('friend_id', $friendId))
                ->orWhere(fn ($query) => $query->where('user_id', $friendId)->where('friend_id', $userId)))
            ->exists();
    }

    private function ensureMember(DuoStreak $duoStreak, int $userId): DuoStreakMember
    {
        $member = $duoStreak->members()->where('user_id', $userId)->where('status', 'accepted')->first();
        abort_unless($member, 403);

        return $member;
    }

    private function todayFor(Request $request): CarbonImmutable
    {
        return CarbonImmutable::now($request->user()->timezone ?: config('app.timezone'))->startOfDay();
    }

    private function recalculate(DuoStreak $duoStreak, CarbonImmutable $today): void
    {
        $memberCount = max(1, $duoStreak->members()->where('status', 'accepted')->count());
        $start = CarbonImmutable::parse($duoStreak->start_date->toDateString(), $today->timezone);
        $completedDates = $duoStreak->logs()
            ->where('completed', true)
            ->whereDate('date', '>=', $start->toDateString())
            ->whereDate('date', '<=', $today->toDateString())
            ->get(['date', 'user_id'])
            ->groupBy(fn ($log) => $log->date->toDateString())
            ->filter(fn (Collection $logs) => $logs->pluck('user_id')->unique()->count() >= $memberCount)
            ->keys();
        $current = 0;
        $cursor = $today;

        while ($cursor->greaterThanOrEqualTo($start)) {
            if (! $completedDates->contains($cursor->toDateString())) {
                break;
            }

            $current++;
            $cursor = $cursor->subDay();
        }

        $best = 0;
        $run = 0;
        $cursor = $start;

        while ($cursor->lessThanOrEqualTo($today)) {
            $run = $completedDates->contains($cursor->toDateString()) ? $run + 1 : 0;
            $best = max($best, $run);
            $cursor = $cursor->addDay();
        }

        $duoStreak->update([
            'current_streak' => $current,
            'best_streak' => max($best, $duoStreak->best_streak),
        ]);
    }
}
