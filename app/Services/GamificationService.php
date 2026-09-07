<?php

namespace App\Services;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class GamificationService
{
    /** @var array<string, array{label: string, description: string, icon: string}> */
    public const QUESTS = [
        'save_memory' => ['label' => 'Lưu một khoảnh khắc', 'description' => 'Giữ lại một điều nhỏ của hôm nay', 'icon' => 'camera'],
        'complete_habit' => ['label' => 'Hoàn thành một thói quen', 'description' => 'Tiến thêm một bước cho điều bạn quan tâm', 'icon' => 'check'],
        'write_note' => ['label' => 'Viết một lời nhắn', 'description' => 'Gửi một dòng chân thành', 'icon' => 'pen'],
        'check_in_friend' => ['label' => 'Check-in cùng bạn', 'description' => 'Cùng nhau giữ nhịp kết nối', 'icon' => 'users'],
    ];

    /** @var array<string, array{label: string, description: string, icon: string}> */
    public const ACHIEVEMENTS = [
        'first_memory' => ['label' => 'Khoảnh khắc đầu tiên', 'description' => 'Lưu lại memory đầu tiên', 'icon' => 'camera'],
        'memories_10' => ['label' => '10 khoảnh khắc', 'description' => 'Lưu 10 memory đáng nhớ', 'icon' => 'sparkles'],
        'memories_100' => ['label' => '100 khoảnh khắc', 'description' => 'Lưu 100 memory theo cách của bạn', 'icon' => 'trophy'],
        'streak_7' => ['label' => 'Chuỗi 7 ngày', 'description' => 'Giữ một chuỗi liên tiếp trong 7 ngày', 'icon' => 'flame'],
        'streak_30' => ['label' => 'Chuỗi 30 ngày', 'description' => 'Giữ một chuỗi liên tiếp trong 30 ngày', 'icon' => 'flame'],
        'coding_100' => ['label' => '100 ngày coding', 'description' => 'Ghi nhận 100 ngày cùng code', 'icon' => 'code'],
        'first_shared_memory' => ['label' => 'Kỷ niệm chung đầu tiên', 'description' => 'Tạo một không gian kỷ niệm cùng bạn', 'icon' => 'heart'],
        'first_duo_streak' => ['label' => 'Chuỗi đôi đầu tiên', 'description' => 'Bắt đầu một chuỗi cùng người bạn', 'icon' => 'users'],
    ];

    public function completeQuest(User $user, string $key, CarbonImmutable|string|null $date = null): void
    {
        if (! isset(self::QUESTS[$key])) {
            return;
        }

        $timezone = $user->timezone ?: config('app.timezone');
        $questDate = $date instanceof CarbonImmutable
            ? $date->setTimezone($timezone)->toDateString()
            : ($date ?: CarbonImmutable::now($timezone)->toDateString());

        DB::table('daily_quest_completions')->insertOrIgnore([
            'user_id' => $user->id,
            'quest_key' => $key,
            'quest_date' => $questDate,
            'completed_at' => now(),
        ]);

        $this->syncAchievements($user);
    }

    public function syncAchievements(User $user): void
    {
        $memoryCount = $user->memories()->count();
        $maxBestStreak = (int) ($user->streaks()->max('best_streak') ?? 0);
        $codingDays = $this->codingDays($user);
        $unlocks = [
            'first_memory' => $memoryCount >= 1,
            'memories_10' => $memoryCount >= 10,
            'memories_100' => $memoryCount >= 100,
            'streak_7' => $maxBestStreak >= 7,
            'streak_30' => $maxBestStreak >= 30,
            'coding_100' => $codingDays >= 100,
            'first_shared_memory' => $user->ownedSharedMemories()->exists(),
            'first_duo_streak' => $user->ownedDuoStreaks()->exists(),
        ];

        $now = now();
        $rows = collect($unlocks)
            ->filter()
            ->keys()
            ->map(fn (string $key) => [
                'user_id' => $user->id,
                'achievement_key' => $key,
                'unlocked_at' => $now,
            ])
            ->values()
            ->all();

        if ($rows !== []) {
            DB::table('user_achievements')->insertOrIgnore($rows);
        }
    }

    /** @return array{quests: array<int, array<string, mixed>>, progress: array{completed: int, total: int, percent: int}, achievements: array<int, array<string, mixed>>} */
    public function dailyData(User $user, CarbonImmutable $today): array
    {
        $this->syncAchievements($user);
        $date = $today->toDateString();
        $completed = $user->dailyQuestCompletions()
            ->whereDate('quest_date', $date)
            ->pluck('quest_key')
            ->flip();
        $quests = collect(self::QUESTS)->map(fn (array $quest, string $key) => [
            'key' => $key,
            ...$quest,
            'completed' => $completed->has($key),
        ])->values()->all();
        $completedCount = collect($quests)->where('completed', true)->count();
        $achievements = $user->userAchievements()
            ->latest('unlocked_at')
            ->get()
            ->map(fn ($achievement) => [
                'key' => $achievement->achievement_key,
                ...self::ACHIEVEMENTS[$achievement->achievement_key],
                'unlocked_at' => $achievement->unlocked_at?->toISOString(),
                'is_new' => $achievement->unlocked_at?->isToday() ?? false,
            ])
            ->values()
            ->all();

        return [
            'quests' => $quests,
            'progress' => [
                'completed' => $completedCount,
                'total' => count(self::QUESTS),
                'percent' => (int) round($completedCount / max(1, count(self::QUESTS)) * 100),
            ],
            'achievements' => $achievements,
        ];
    }

    private function codingDays(User $user): int
    {
        $streakIds = $user->streaks()
            ->where(function ($query): void {
                $query
                    ->where('name', 'like', '%code%')
                    ->orWhere('name', 'like', '%lập trình%')
                    ->orWhere('icon', 'code');
            })
            ->pluck('id');

        if ($streakIds->isEmpty()) {
            return 0;
        }

        return (int) DB::table('streak_logs')
            ->whereIn('streak_id', $streakIds)
            ->where('completed', true)
            ->distinct()
            ->count('date');
    }
}
