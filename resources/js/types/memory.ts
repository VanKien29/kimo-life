import { type PhotoItem } from '@/components/shared/single-photo';

export interface MemoryActivity {
    id: number;
    name: string;
    icon?: string | null;
    color?: string | null;
}

export interface MemoryReaction {
    reaction: string;
    count: number;
    reacted: boolean;
}

export interface MemoryComment {
    id: number;
    content: string;
    created_at: string | null;
    user: { id: number; name: string; username?: string | null; avatar?: string | null };
    is_mine: boolean;
}

export interface MemoryItem {
    id: number;
    title: string | null;
    content: string | null;
    memory_date: string;
    mood: string | null;
    visibility: 'private' | 'friends' | 'public';
    location: string | null;
    created_at?: string | null;
    time_label?: string | null;
    photos: Array<PhotoItem & { originalSrc?: string; width?: number | null; height?: number | null }>;
    activities: MemoryActivity[];
    tags: string[];
    is_favorite: boolean;
    owner?: {
        id: number;
        name: string;
        username?: string | null;
        avatar?: string | null;
    } | null;
    reactions?: MemoryReaction[];
    comments?: MemoryComment[];
}

export interface MemoryOption {
    id: number;
    name: string;
    icon?: string | null;
    color?: string | null;
}

export interface MemoryPaginator {
    data: MemoryItem[];
    total?: number;
    current_page: number;
    last_page: number;
    next_page_url?: string | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface MemorySearchFilters {
    q: string;
    date_from: string | null;
    date_to: string | null;
    activity_id: number | null;
    mood: string;
    tag: string;
    location: string;
    is_searching: boolean;
    result_count: number;
}
