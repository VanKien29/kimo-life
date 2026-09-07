import { type MemoryActivity, type MemoryItem } from '@/types/memory';

export interface CalendarInfo {
    year: number;
    month: number;
    label: string;
    previous: string;
    next: string;
    leading_empty_days: number;
}

export interface CalendarPhoto {
    id?: number | string;
    src: string;
    alt?: string;
    caption?: string | null;
}

export interface CalendarDay {
    date: string;
    day: number;
    is_today: boolean;
    is_future: boolean;
    memory_count: number;
    mood: string | null;
    title?: string | null;
    location?: string | null;
    photos?: CalendarPhoto[];
    thumbnail: { src: string; alt: string } | null;
}

export interface CalendarPageProps {
    calendar: CalendarInfo;
    days: CalendarDay[];
    today: string;
}

export interface DayInfo {
    date: string;
    weekday: string;
    formatted: string;
    is_today: boolean;
}

export interface DayStats {
    memories: number;
    activities: number;
    mood: { value: string; label: string; emoji: string } | null;
}

export interface DayDetailPageProps {
    day: DayInfo;
    memories: MemoryItem[];
    activities: MemoryActivity[];
    stats: DayStats;
}
