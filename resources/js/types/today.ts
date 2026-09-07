import { type MemoryActivity, type MemoryItem } from '@/types/memory';

export interface TodayInfo {
    date: string;
    weekday: string;
    formatted: string;
}

export interface TodayMood {
    value: string;
    label: string;
    emoji: string;
}

export interface TodayStats {
    moments: number;
    activities: number;
    mood: TodayMood | null;
    streak: number;
}

export interface DailyQuestItem {
    key: string;
    label: string;
    description: string;
    icon: string;
    completed: boolean;
}

export interface QuestProgress {
    completed: number;
    total: number;
    percent: number;
}

export interface AchievementItem {
    key: string;
    label: string;
    description: string;
    icon: string;
    unlocked_at: string | null;
    is_new: boolean;
}

export interface TodayPhotoItem {
    id: number | string;
    memory_id?: number | null;
    title?: string;
    src: string;
    originalSrc?: string;
    alt?: string;
}

export interface ActiveHabitItem {
    id: number;
    name: string;
    icon: string;
    color: string;
    current_streak: number;
    checked_in_today: boolean;
}

export interface TogetherSummary {
    friendsCount: number;
    duoCount: number;
}

export interface TodayPageProps {
    today: TodayInfo;
    memories: MemoryItem[];
    todayPhotos?: TodayPhotoItem[];
    activeHabits?: ActiveHabitItem[];
    togetherSummary?: TogetherSummary;
    activities: MemoryActivity[];
    stats: TodayStats;
    dailyQuests?: DailyQuestItem[];
    questProgress?: QuestProgress;
    achievements?: AchievementItem[];
    status?: string;
}
