export type NotificationTab = 'all' | 'friends' | 'streaks';

export interface NotificationItem {
    id: number;
    type: string;
    data: { message?: string; url?: string; [key: string]: unknown };
    read_at: string | null;
    created_at: string | null;
    actor: { id: number; name: string; username?: string | null; avatar?: string | null } | null;
}

export interface NotificationPaginator {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface NotificationPageProps {
    notifications: NotificationPaginator;
    activeTab: NotificationTab;
    unreadCount: number;
    status?: string;
}
