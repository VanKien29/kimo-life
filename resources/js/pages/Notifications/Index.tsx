import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type NotificationItem, type NotificationPageProps, type NotificationTab } from '@/types/notification';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus, UsersRound, X } from 'lucide-react';

const tabs: Array<{ value: NotificationTab; label: string }> = [
    { value: 'all', label: 'Tất cả' },
    { value: 'friends', label: 'Bạn bè' },
    { value: 'streaks', label: 'Thói quen' },
];

const labels: Record<string, { title: string; icon: typeof Bell }> = {
    friend_request: { title: 'Lời mời kết bạn', icon: UserPlus },
    friend_accepted: { title: 'Kết nối mới', icon: UsersRound },
    reaction: { title: 'Cảm xúc mới', icon: Heart },
    comment: { title: 'Bình luận mới', icon: MessageCircle },
    memory_share: { title: 'Kỷ niệm chung', icon: Bell },
    duo_streak: { title: 'Chuỗi chung', icon: Bell },
    challenge: { title: 'Thử thách nhóm', icon: Bell },
    reminder: { title: 'Lời nhắc check-in', icon: Bell },
    streak: { title: 'Chuỗi của bạn', icon: Bell },
};

function timeLabel(value: string | null): string {
    if (!value) return 'Vừa xong';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function NotificationRow({ item }: { item: NotificationItem }) {
    const meta = labels[item.type] ?? { title: 'Thông báo', icon: Bell };
    const Icon = meta.icon;
    const actorName = item.actor?.name ?? 'Kimo Life';
    const message = item.data.message ?? 'vừa có một cập nhật mới.';
    const content = <>
        <span className="font-semibold">{actorName}</span> {message}
    </>;

    const row = (
        <div className={`flex gap-3 rounded-2xl p-3 transition-colors ${item.read_at ? 'bg-brand-surface hover:bg-brand-pale/40' : 'bg-brand-pale/70 hover:bg-brand-pale'}`}>
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${item.read_at ? 'bg-brand-pale text-brand-primary-dark' : 'bg-brand-primary text-white'}`}>
                <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm leading-6">{content}</p>
                <p className="text-brand-muted mt-1 text-xs">{meta.title} · {timeLabel(item.created_at)}</p>
            </div>
            {!item.read_at && <span className="bg-brand-primary mt-2 size-2.5 shrink-0 rounded-full" aria-label="Chưa đọc" />}
        </div>
    );

    return item.data.url ? <Link href={item.data.url} className="block" preserveScroll>{row}</Link> : row;
}

export default function NotificationsIndex({ notifications, activeTab, unreadCount, status }: NotificationPageProps) {
    const changeTab = (tab: NotificationTab) => router.get(route('notifications.index'), { tab }, { preserveState: true, preserveScroll: true });

    return (
        <AppLayout>
            <Head title="Thông báo" />
            <div className="mx-auto max-w-3xl space-y-5 py-2 sm:py-4">
                {status && <Toast title={status} />}

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Thông báo</h1>
                        <p className="text-brand-secondary mt-1 text-sm">Không bỏ lỡ điều quan trọng</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => router.patch(route('notifications.read-all'), {}, { preserveScroll: true })}
                        >
                            <CheckCheck />
                            Đọc tất cả
                        </Button>
                    )}
                </div>

                {/* Tabs — Pill style */}
                <div className="bg-brand-surface border-brand-border flex gap-1 overflow-x-auto rounded-2xl border p-1" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.value}
                            onClick={() => changeTab(tab.value)}
                            className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                                activeTab === tab.value
                                    ? 'bg-brand-pale text-brand-primary-dark shadow-soft'
                                    : 'text-brand-secondary hover:bg-brand-background'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                <Card className="space-y-1 p-2 sm:p-3">
                    {notifications.data.length === 0 ? (
                        <div className="text-brand-secondary flex flex-col items-center gap-2 py-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-brand-pale">
                                <X className="text-brand-muted size-6" />
                            </div>
                            <p className="mt-2 font-medium">Chưa có thông báo trong mục này.</p>
                        </div>
                    ) : (
                        notifications.data.map((item) => <NotificationRow key={item.id} item={item} />)
                    )}
                </Card>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {notifications.links.map((link) =>
                            link.url && (
                                <Link
                                    key={link.label}
                                    href={link.url}
                                    className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                                        link.active
                                            ? 'bg-brand-primary text-white shadow-soft'
                                            : 'bg-brand-surface text-brand-secondary hover:bg-brand-pale'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
