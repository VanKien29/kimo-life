import { type MemoryOption } from '@/types/memory';

export type StreakGoalType = 'every_day' | 'weekdays' | 'x_days_per_week';

export interface StreakFrequency {
    days?: number[];
    count?: number;
}

export interface StreakHeatmapDay {
    date: string;
    completed: boolean;
    is_today: boolean;
}

export interface StreakActivity {
    id: number;
    name: string;
}

export interface StreakItem {
    id: number;
    name: string;
    icon: string;
    color: string;
    goal_type: StreakGoalType;
    frequency: StreakFrequency | null;
    goal_label: string;
    unit_label: 'ngày' | 'tuần';
    start_date: string;
    current_streak: number;
    best_streak: number;
    total_check_ins: number;
    today_completed: boolean;
    can_check_in: boolean;
    heatmap: StreakHeatmapDay[];
    activity: StreakActivity | null;
}

export interface StreakPageProps {
    streaks: StreakItem[];
    activities: MemoryOption[];
    status?: string;
}
