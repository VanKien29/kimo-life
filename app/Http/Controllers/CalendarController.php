<?php

namespace App\Http\Controllers;

use App\Models\Memory;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $timezone = $request->user()->timezone ?: config('app.timezone');
        $today = CarbonImmutable::now($timezone);
        $month = $this->resolveMonth($request, $timezone, $today);
        $monthStart = $month->startOfMonth();
        $monthEnd = $month->endOfMonth();
        $memories = $request->user()->memories()
            ->whereBetween('memory_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->with('photos')
            ->latest()
            ->get();
        $memoriesByDate = $memories->groupBy(fn (Memory $memory) => $memory->memory_date->toDateString());

        $resolveUrl = function (?string $p) {
            if (! $p) return null;
            if (str_starts_with($p, '/')) return $p;
            if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) {
                $path = parse_url($p, PHP_URL_PATH);
                return $path ?: $p;
            }
            return '/storage/' . ltrim($p, '/');
        };

        return Inertia::render('Calendar/Index', [
            'calendar' => [
                'year' => $monthStart->year,
                'month' => $monthStart->month,
                'label' => 'Tháng '.$monthStart->month.' '.$monthStart->year,
                'previous' => $monthStart->subMonth()->format('Y-m'),
                'next' => $monthStart->addMonth()->format('Y-m'),
                'leading_empty_days' => $monthStart->dayOfWeekIso - 1,
            ],
            'days' => collect(range(1, $monthStart->daysInMonth))->map(function (int $day) use ($monthStart, $memoriesByDate, $today, $resolveUrl) {
                $date = $monthStart->setDay($day);
                $dayMemories = $memoriesByDate->get($date->toDateString(), collect());
                $photos = $dayMemories->flatMap->photos
                    ->take(6)
                    ->map(function ($photo) use ($day, $resolveUrl) {
                        return [
                            'id' => $photo->id,
                            'src' => $resolveUrl($photo->thumbnail_path ?: $photo->path),
                            'alt' => 'Ảnh trong ngày '.$day,
                            'caption' => $photo->caption ?? null,
                        ];
                    })
                    ->filter(fn ($p) => ! empty($p['src']))
                    ->values()
                    ->all();

                $firstMemory = $dayMemories->first();
                $mood = $dayMemories->first(fn (Memory $memory) => filled($memory->mood))?->mood;

                return [
                    'date' => $date->toDateString(),
                    'day' => $day,
                    'is_today' => $date->isSameDay($today),
                    'is_future' => $date->greaterThan($today),
                    'memory_count' => $dayMemories->count(),
                    'mood' => $mood,
                    'title' => $firstMemory?->title ?: ($firstMemory ? \Illuminate\Support\Str::limit($firstMemory->content, 40) : null),
                    'location' => $firstMemory?->location,
                    'photos' => $photos,
                    'thumbnail' => $photos[0] ?? null,
                ];
            })->values(),
            'today' => $today->toDateString(),
        ]);
    }

    public function day(Request $request, string $date): Response
    {
        $timezone = $request->user()->timezone ?: config('app.timezone');
        $selectedDate = $this->resolveDate($date, $timezone);
        $memories = $request->user()->memories()
            ->whereDate('memory_date', $selectedDate->toDateString())
            ->with(['photos', 'activities', 'tags'])
            ->latest()
            ->get();
        $activities = $memories->flatMap->activities->unique('id')->values();
        $latestMood = $memories->first(fn (Memory $memory) => filled($memory->mood))?->mood;

        return Inertia::render('Calendar/Day', [
            'day' => [
                'date' => $selectedDate->toDateString(),
                'weekday' => $this->weekdayLabel($selectedDate),
                'formatted' => $selectedDate->day.' Tháng '.$selectedDate->month.', '.$selectedDate->year,
                'is_today' => $selectedDate->isToday(),
            ],
            'memories' => $memories->map(fn (Memory $memory) => $this->serializeMemory($request, $memory, $timezone))->values(),
            'activities' => $activities->map(fn ($activity) => [
                'id' => $activity->id,
                'name' => $activity->name,
                'icon' => $activity->icon,
                'color' => $activity->color,
            ])->values(),
            'stats' => [
                'memories' => $memories->count(),
                'activities' => $activities->count(),
                'mood' => $this->moodLabel($latestMood),
            ],
        ]);
    }

    private function resolveMonth(Request $request, string $timezone, CarbonImmutable $today): CarbonImmutable
    {
        $value = (string) $request->input('month', $today->format('Y-m'));

        try {
            $month = CarbonImmutable::createFromFormat('!Y-m', $value, $timezone);

            if (! $month || $month->format('Y-m') !== $value) {
                throw new \InvalidArgumentException;
            }

            return $month->startOfMonth();
        } catch (\Throwable) {
            return $today->startOfMonth();
        }
    }

    private function resolveDate(string $value, string $timezone): CarbonImmutable
    {
        try {
            $date = CarbonImmutable::createFromFormat('!Y-m-d', $value, $timezone);

            if (! $date || $date->format('Y-m-d') !== $value) {
                throw new \InvalidArgumentException;
            }

            return $date;
        } catch (\Throwable) {
            abort(404);
        }
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

    /** @return array<string, mixed> */
    private function serializeMemory(Request $request, Memory $memory, string $timezone): array
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
            'created_at' => $memory->created_at?->setTimezone($timezone)->toIso8601String(),
            'time_label' => $memory->created_at?->setTimezone($timezone)->format('H:i'),
            'photos' => $memory->photos->map(function ($photo) use ($disk, $memory) {
                $resolve = fn (?string $p) => $p ? (str_starts_with($p, 'http') || str_starts_with($p, '/images/') ? $p : Storage::disk($disk)->url($p)) : null;
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
