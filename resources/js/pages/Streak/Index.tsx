import { StreakCard } from '@/components/streak/streak-card';
import { StreakComposer } from '@/components/streak/streak-composer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { pageMotion } from '@/lib/motion';
import { type StreakItem, type StreakPageProps } from '@/types/streak';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Flame, ListChecks, Plus, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

type StreakTab = 'all' | 'active' | 'completed';

const tabs: Array<{ value: StreakTab; label: string }> = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang làm' },
    { value: 'completed', label: 'Đã hoàn thành' },
];

export default function Streak({ streaks, activities, status }: StreakPageProps) {
    const [composerOpen, setComposerOpen] = useState(false);
    const [editingStreak, setEditingStreak] = useState<StreakItem | null>(null);
    const [activeTab, setActiveTab] = useState<StreakTab>('all');
    const reduceMotion = useReducedMotion();
    const totalCheckIns = streaks.reduce((total, streak) => total + streak.total_check_ins, 0);
    const bestCurrent = streaks.reduce((best, streak) => Math.max(best, streak.current_streak), 0);

    const openCreate = () => {
        setEditingStreak(null);
        setComposerOpen(true);
    };

    const openEdit = (streak: StreakItem) => {
        setEditingStreak(streak);
        setComposerOpen(true);
    };

    const filteredStreaks = streaks.filter((streak) => {
        if (activeTab === 'active') return streak.current_streak > 0 || streak.today_completed === false;
        if (activeTab === 'completed') return streak.today_completed === true;
        return true;
    });

    return (
        <AppLayout>
            <Head title="Thói quen" />

            <div className="space-y-6 py-2 sm:space-y-8 sm:py-4">
                {status && <Toast title={status} />}

                {/* Header — "Thói quen của tôi" */}
                <motion.section
                    initial={reduceMotion ? false : 'initial'}
                    animate="animate"
                    variants={pageMotion}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <p className="text-brand-primary-dark text-sm font-medium">Nhịp sống</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Thói quen của tôi</h1>
                        <p className="text-brand-secondary mt-1 text-sm">
                            Mỗi lần check-in là một dấu chấm nhỏ trên hành trình bạn đang chọn.
                        </p>
                    </div>
                    <Button type="button" onClick={openCreate} className="shrink-0">
                        <Plus />
                        Tạo chuỗi mới
                    </Button>
                </motion.section>

                {/* Stats Row */}
                <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Tổng quan chuỗi">
                    <Card className="border-0 p-3 sm:p-5">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-brand-pale">
                                <ListChecks className="size-4 text-brand-primary-dark" />
                            </span>
                            <span className="text-[11px] font-medium text-brand-secondary sm:text-sm">Đang hoạt động</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold sm:text-3xl">{streaks.length}</p>
                    </Card>
                    <Card className="border-0 p-3 sm:p-5">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-orange-50">
                                <Flame className="size-4 text-brand-streak" />
                            </span>
                            <span className="text-[11px] font-medium text-brand-secondary sm:text-sm">Nhịp cao nhất</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold sm:text-3xl">{bestCurrent}</p>
                    </Card>
                    <Card className="border-0 p-3 sm:p-5">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-50">
                                <Sparkles className="size-4 text-indigo-500" />
                            </span>
                            <span className="text-[11px] font-medium text-brand-secondary sm:text-sm">Tổng check-in</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold sm:text-3xl">{totalCheckIns}</p>
                    </Card>
                </section>

                {/* Filter Tabs */}
                <div className="bg-brand-surface border-brand-border flex gap-1 overflow-x-auto rounded-2xl border p-1" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.value}
                            onClick={() => setActiveTab(tab.value)}
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

                {/* Streak List */}
                {streaks.length === 0 ? (
                    <EmptyState
                        title="Bạn chưa có chuỗi nào."
                        description="Chọn một thói quen vừa sức để bắt đầu tạo nhịp cho ngày của mình."
                        action={
                            <Button type="button" onClick={openCreate}>
                                <Plus />
                                Tạo chuỗi đầu tiên
                            </Button>
                        }
                    />
                ) : (
                    <motion.section
                        initial={reduceMotion ? false : 'initial'}
                        animate="animate"
                        variants={pageMotion}
                        className="space-y-4"
                        aria-labelledby="streak-list-title"
                    >
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <h2 id="streak-list-title" className="text-xl font-bold tracking-tight">
                                    Các chuỗi đang giữ
                                </h2>
                            </div>
                            <span className="text-brand-secondary text-sm">{filteredStreaks.length} chuỗi</span>
                        </div>
                        <div className="grid gap-5 lg:grid-cols-2">
                            {filteredStreaks.map((streak) => (
                                <StreakCard key={streak.id} streak={streak} onEdit={openEdit} />
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Activities Link */}
                <Card className="border-0 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="bg-brand-pale text-brand-primary-dark rounded-xl p-2.5">
                            <ListChecks className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-lg font-bold">Các hoạt động của bạn</h2>
                            <p className="text-brand-secondary mt-1 text-sm leading-6">Đặt tên và màu riêng cho những việc bạn thường làm.</p>
                        </div>
                    </div>
                    <Link
                        href={route('activities.index')}
                        className="text-brand-primary-dark mt-5 inline-flex items-center gap-1 text-sm font-semibold"
                    >
                        Quản lý hoạt động <ArrowRight className="size-4" />
                    </Link>
                </Card>
            </div>

            <StreakComposer
                key={editingStreak?.id ?? 'new'}
                open={composerOpen}
                onOpenChange={setComposerOpen}
                activities={activities}
                streak={editingStreak}
            />
        </AppLayout>
    );
}
