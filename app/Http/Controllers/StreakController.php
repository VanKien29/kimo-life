<?php

namespace App\Http\Controllers;

use App\Http\Requests\StreakStoreRequest;
use App\Http\Requests\StreakUpdateRequest;
use App\Models\Streak;
use App\Services\GamificationService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StreakController extends Controller
{
    public function __construct(private readonly GamificationService $gamification) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $timezone = $user->timezone ?: config('app.timezone');
        $today = CarbonImmutable::now($timezone);
        $heatmapDays = (int) config('kimo.streaks.heatmap_days', 84);
        $historyStart = $today->subDays($heatmapDays - 1)->toDateString();
        $streaks = $user->streaks()
            ->where('active', true)
            ->with([
                'activity',
                'logs' => fn ($query) => $query
                    ->whereDate('date', '>=', $historyStart)
                    ->whereDate('date', '<=', $today->toDateString()),
            ])
            ->latest()
            ->get();
        $streaks->each(fn (Streak $streak) => $this->recalculate($streak, $today));

        return Inertia::render('Streak/Index', [
            'streaks' => $streaks->map(fn (Streak $streak) => $this->serializeStreak($streak, $today, $heatmapDays))->values(),
            'activities' => $user->activities()->whereNull('archived_at')->latest()->get(['id', 'name', 'icon', 'color']),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(StreakStoreRequest $request): RedirectResponse
    {
        $today = $this->todayFor($request);
        $data = $request->validated();
        $request->user()->streaks()->create([
            'activity_id' => $data['activity_id'] ?? null,
            'name' => $data['name'],
            'icon' => $data['icon'],
            'color' => $data['color'],
            'goal_type' => $data['goal_type'],
            'frequency' => $this->normalizeFrequency($data),
            'start_date' => $today->toDateString(),
            'active' => true,
            'current_streak' => 0,
            'best_streak' => 0,
        ]);

        return to_route('streak')->with('status', 'Đã tạo chuỗi mới.');
    }

    public function update(StreakUpdateRequest $request, Streak $streak): RedirectResponse
    {
        $this->ensureOwner($request, $streak);
        $data = $request->validated();
        $streak->update([
            'activity_id' => $data['activity_id'] ?? null,
            'name' => $data['name'],
            'icon' => $data['icon'],
            'color' => $data['color'],
            'goal_type' => $data['goal_type'],
            'frequency' => $this->normalizeFrequency($data),
        ]);
        $this->recalculate($streak, $this->todayFor($request));

        return to_route('streak')->with('status', 'Đã cập nhật chuỗi.');
    }

    public function deactivate(Request $request, Streak $streak): RedirectResponse
    {
        $this->ensureOwner($request, $streak);
        $streak->update(['active' => false]);

        return to_route('streak')->with('status', 'Đã tạm dừng chuỗi.');
    }

    public function checkIn(Request $request, Streak $streak): RedirectResponse
    {
        $this->ensureOwner($request, $streak);
        $today = $this->todayFor($request);

        if (! $this->canCheckIn($streak, $today)) {
            throw ValidationException::withMessages([
                'check_in' => 'Hôm nay không nằm trong lịch của chuỗi này.',
            ]);
        }

        $alreadyCompleted = $streak->logs()->whereDate('date', $today->toDateString())->where('completed', true)->exists();

        DB::transaction(function () use ($streak, $today): void {
            $streak->logs()->updateOrCreate(
                ['date' => $today->toDateString()],
                ['completed' => true],
            );
            $this->recalculate($streak->fresh(), $today);
        });
        $this->gamification->completeQuest($request->user(), 'complete_habit', $today);

        return back()->with('status', $alreadyCompleted ? 'Chuỗi này đã được check-in hôm nay.' : 'Đã check-in hôm nay 🔥');
    }

    private function ensureOwner(Request $request, Streak $streak): void
    {
        abort_unless($streak->user_id === $request->user()->id, 403);
        abort_if(! $streak->active, 404);
    }

    private function todayFor(Request $request): CarbonImmutable
    {
        return CarbonImmutable::now($request->user()->timezone ?: config('app.timezone'))->startOfDay();
    }

    /** @param array<string, mixed> $data */
    private function normalizeFrequency(array $data): ?array
    {
        return match ($data['goal_type']) {
            'weekdays' => ['days' => collect($data['frequency']['days'] ?? [])->map(fn ($day) => (int) $day)->unique()->sort()->values()->all()],
            'x_days_per_week' => ['count' => (int) ($data['frequency']['count'] ?? 1)],
            default => null,
        };
    }

    private function canCheckIn(Streak $streak, CarbonImmutable $today): bool
    {
        if ($today->lessThan(CarbonImmutable::parse($streak->start_date->toDateString(), $today->timezone))) {
            return false;
        }

        return $streak->goal_type !== 'weekdays' || in_array($today->dayOfWeekIso, $streak->frequency['days'] ?? [], true);
    }

    private function recalculate(Streak $streak, CarbonImmutable $today): void
    {
        $start = CarbonImmutable::parse($streak->start_date->toDateString(), $today->timezone);
        $completed = $streak->logs()
            ->where('completed', true)
            ->whereDate('date', '>=', $start->toDateString())
            ->whereDate('date', '<=', $today->toDateString())
            ->pluck('date')
            ->mapWithKeys(fn ($date) => [CarbonImmutable::parse($date, $today->timezone)->toDateString() => true]);

        if ($streak->goal_type === 'x_days_per_week') {
            [$current, $best] = $this->weeklyMetrics($completed, $start, $today, (int) ($streak->frequency['count'] ?? 1));
        } else {
            $scheduled = $streak->goal_type === 'weekdays' ? ($streak->frequency['days'] ?? []) : null;
            [$current, $best] = $this->dailyMetrics($completed, $start, $today, $scheduled);
        }

        $streak->update([
            'current_streak' => $current,
            'best_streak' => max($best, $streak->best_streak),
        ]);
    }

    /** @param Collection<string, bool> $completed */
    private function dailyMetrics($completed, CarbonImmutable $start, CarbonImmutable $today, ?array $scheduled): array
    {
        $current = 0;
        $cursor = $today;

        while ($cursor->greaterThanOrEqualTo($start)) {
            if ($scheduled === null || in_array($cursor->dayOfWeekIso, $scheduled, true)) {
                if (! $completed->has($cursor->toDateString())) {
                    break;
                }

                $current++;
            }

            $cursor = $cursor->subDay();
        }

        $best = 0;
        $run = 0;
        $cursor = $start;

        while ($cursor->lessThanOrEqualTo($today)) {
            if ($scheduled === null || in_array($cursor->dayOfWeekIso, $scheduled, true)) {
                $run = $completed->has($cursor->toDateString()) ? $run + 1 : 0;
                $best = max($best, $run);
            }

            $cursor = $cursor->addDay();
        }

        return [$current, $best];
    }

    /** @param Collection<string, bool> $completed */
    private function weeklyMetrics($completed, CarbonImmutable $start, CarbonImmutable $today, int $target): array
    {
        $startWeek = $this->weekStart($start);
        $currentWeek = $this->weekStart($today);
        $current = 0;
        $best = 0;
        $run = 0;
        $cursor = $startWeek;

        while ($cursor->lessThanOrEqualTo($currentWeek)) {
            $count = $this->completedInWeek($completed, $cursor, $start, $today);
            $complete = $count >= $target;
            $run = $complete ? $run + 1 : 0;
            $best = max($best, $run);
            $cursor = $cursor->addWeek();
        }

        $cursor = $currentWeek;
        while ($cursor->greaterThanOrEqualTo($startWeek)) {
            if ($this->completedInWeek($completed, $cursor, $start, $today) < $target) {
                break;
            }

            $current++;
            $cursor = $cursor->subWeek();
        }

        return [$current, $best];
    }

    /** @param Collection<string, bool> $completed */
    private function completedInWeek($completed, CarbonImmutable $weekStart, CarbonImmutable $start, CarbonImmutable $today): int
    {
        $count = 0;
        $cursor = $weekStart;

        for ($index = 0; $index < 7; $index++) {
            if ($cursor->greaterThanOrEqualTo($start) && $cursor->lessThanOrEqualTo($today) && $completed->has($cursor->toDateString())) {
                $count++;
            }

            $cursor = $cursor->addDay();
        }

        return $count;
    }

    private function weekStart(CarbonImmutable $date): CarbonImmutable
    {
        return $date->subDays($date->dayOfWeekIso - 1)->startOfDay();
    }

    /** @return array<string, mixed> */
    private function serializeStreak(Streak $streak, CarbonImmutable $today, int $heatmapDays): array
    {
        $logs = $streak->logs->keyBy(fn ($log) => $log->date->toDateString());
        $heatmap = collect(range(0, $heatmapDays - 1))->map(function (int $offset) use ($today, $logs, $heatmapDays) {
            $date = $today->subDays($heatmapDays - 1 - $offset);

            return [
                'date' => $date->toDateString(),
                'completed' => (bool) ($logs->get($date->toDateString())?->completed ?? false),
                'is_today' => $date->isSameDay($today),
            ];
        })->values();

        return [
            'id' => $streak->id,
            'name' => $streak->name,
            'icon' => $streak->icon,
            'color' => $streak->color,
            'goal_type' => $streak->goal_type,
            'frequency' => $streak->frequency,
            'goal_label' => $this->goalLabel($streak),
            'unit_label' => $streak->goal_type === 'x_days_per_week' ? 'tuần' : 'ngày',
            'start_date' => $streak->start_date->format('Y-m-d'),
            'current_streak' => $streak->current_streak,
            'best_streak' => $streak->best_streak,
            'total_check_ins' => $streak->logs()->where('completed', true)->count(),
            'today_completed' => (bool) ($logs->get($today->toDateString())?->completed ?? false),
            'can_check_in' => $this->canCheckIn($streak, $today),
            'heatmap' => $heatmap,
            'activity' => $streak->activity ? [
                'id' => $streak->activity->id,
                'name' => $streak->activity->name,
            ] : null,
        ];
    }

    private function goalLabel(Streak $streak): string
    {
        return match ($streak->goal_type) {
            'weekdays' => 'Theo ngày đã chọn trong tuần',
            'x_days_per_week' => ($streak->frequency['count'] ?? 1).' ngày mỗi tuần',
            default => 'Mỗi ngày',
        };
    }
}
