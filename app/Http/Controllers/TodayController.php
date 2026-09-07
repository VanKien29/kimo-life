<?php

namespace App\Http\Controllers;

use App\Models\Memory;
use App\Services\GamificationService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TodayController extends Controller
{
    public function __construct(private readonly GamificationService $gamification) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $timezone = $user->timezone ?: config('app.timezone');
        $today = CarbonImmutable::now($timezone);
        $todayDate = $today->toDateString();

        $memories = $user->memories()
            ->whereDate('memory_date', $todayDate)
            ->with(['photos', 'activities', 'tags'])
            ->latest()
            ->get();
        $activities = $memories->flatMap->activities->unique('id')->values();
        $latestMood = $memories->first(fn (Memory $memory) => filled($memory->mood))?->mood;
        $gamification = $this->gamification->dailyData($user, $today);

        $resolveUrl = function (?string $p) {
            if (! $p) return null;
            if (str_starts_with($p, '/')) return $p;
            if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) {
                $path = parse_url($p, PHP_URL_PATH);
                return $path ?: $p;
            }
            return '/storage/' . ltrim($p, '/');
        };

        $todayPhotos = collect();
        foreach ($memories as $mem) {
            foreach ($mem->photos as $ph) {
                $src = $resolveUrl($ph->thumbnail_path ?: $ph->path);
                if ($src) {
                    $todayPhotos->push([
                        'id' => $ph->id,
                        'memory_id' => $mem->id,
                        'title' => $mem->title,
                        'src' => $src,
                        'originalSrc' => $resolveUrl($ph->path),
                        'alt' => $mem->title ?: 'Khoảnh khắc hôm nay',
                    ]);
                }
                if ($todayPhotos->count() >= 5) {
                    break 2;
                }
            }
        }

        $activeHabits = $user->streaks()
            ->where('active', true)
            ->with(['activity'])
            ->latest()
            ->get()
            ->map(function ($s) use ($todayDate) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'icon' => $s->icon ?: 'Sparkles',
                    'color' => $s->color ?: '#10b981',
                    'current_streak' => $s->current_streak,
                    'checked_in_today' => $s->logs()->whereDate('date', $todayDate)->where('completed', true)->exists(),
                ];
            })->values();

        $friendsCount = \App\Models\Friendship::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
        })->where('status', 'accepted')->count();

        $duoCount = \App\Models\DuoStreakMember::where('user_id', $user->id)->count();

        return Inertia::render('Today/Index', [
            'today' => [
                'date' => $todayDate,
                'weekday' => $this->weekdayLabel($today),
                'formatted' => sprintf('%02d %s, %04d', $today->day, $this->monthLabel($today), $today->year),
            ],
            'todayPhotos' => $todayPhotos,
            'activeHabits' => $activeHabits,
            'togetherSummary' => [
                'friendsCount' => $friendsCount,
                'duoCount' => $duoCount,
            ],
            'memories' => $memories->map(fn (Memory $memory) => $this->serializeMemory($request, $memory))->values(),
            'activities' => $activities->map(fn ($activity) => [
                'id' => $activity->id,
                'name' => $activity->name,
                'icon' => $activity->icon,
                'color' => $activity->color,
            ])->values(),
            'stats' => [
                'moments' => $memories->count(),
                'activities' => $activities->count(),
                'mood' => $this->moodLabel($latestMood),
                'streak' => $this->memoryStreak($request, $today),
            ],
            'dailyQuests' => $gamification['quests'],
            'questProgress' => $gamification['progress'],
            'achievements' => $gamification['achievements'],
            'status' => $request->session()->get('status'),
        ]);
    }

    private function weekdayLabel(CarbonImmutable $date): string
    {
        return [
            'Chủ nhật',
            'Thứ Hai',
            'Thứ Ba',
            'Thứ Tư',
            'Thứ Năm',
            'Thứ Sáu',
            'Thứ Bảy',
        ][$date->dayOfWeek];
    }

    private function monthLabel(CarbonImmutable $date): string
    {
        return 'Tháng '.$date->month;
    }

    /** @return array{value: string, label: string, emoji: string}|null */
    private function moodLabel(?string $mood): ?array
    {
        $moods = [
            'vui' => ['label' => 'Vui', 'emoji' => '😊'],
            'binh-yen' => ['label' => 'Bình yên', 'emoji' => '🌿'],
            'biet-on' => ['label' => 'Biết ơn', 'emoji' => '💛'],
            'hao-hung' => ['label' => 'Hào hứng', 'emoji' => '✨'],
            'met' => ['label' => 'Hơi mệt', 'emoji' => '🌙'],
        ];

        return $mood && isset($moods[$mood]) ? ['value' => $mood, ...$moods[$mood]] : null;
    }

    private function memoryStreak(Request $request, CarbonImmutable $today): int
    {
        $timezone = $request->user()->timezone ?: config('app.timezone');
        $cursor = $today->toDateString();
        $dates = $request->user()->memories()
            ->whereDate('memory_date', '<=', $cursor)
            ->select('memory_date')
            ->distinct()
            ->orderByDesc('memory_date')
            ->pluck('memory_date');
        $streak = 0;

        foreach ($dates as $date) {
            $dateString = CarbonImmutable::parse($date, $timezone)->toDateString();

            if ($dateString !== $cursor) {
                break;
            }

            $streak++;
            $cursor = CarbonImmutable::parse($cursor, $timezone)->subDay()->toDateString();
        }

        return $streak;
    }

    /** @return array<string, mixed> */
    private function serializeMemory(Request $request, Memory $memory): array
    {
        $disk = config('kimo.photos.disk', 'public');

        return [
            'id' => $memory->id,
            'title' => $memory->title,
            'content' => $memory->content,
            'memory_date' => $memory->memory_date?->format('Y-m-d'),
            'mood' => $memory->mood,
            'visibility' => $memory->visibility,
            'location' => $memory->location,
            'photos' => $memory->photos->map(function ($photo) use ($memory) {
                $resolve = function (?string $p) {
                    if (! $p) return null;
                    if (str_starts_with($p, '/')) return $p;
                    if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) {
                        $path = parse_url($p, PHP_URL_PATH);
                        return $path ?: $p;
                    }
                    return '/storage/' . ltrim($p, '/');
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
    }
}
