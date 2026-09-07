import { StreakIcon, streakColorClass } from '@/components/streak/streak-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type StreakItem } from '@/types/streak';
import { router } from '@inertiajs/react';
import { Check, Flame, MoreHorizontal, Pause, Pencil } from 'lucide-react';

interface StreakCardProps {
    streak: StreakItem;
    onEdit: (streak: StreakItem) => void;
}

const heatmapClass = (color: string, completed: boolean) => {
    if (!completed) return 'bg-brand-pale/60';
    if (color === 'blue') return 'bg-blue-400';
    if (color === 'orange') return 'bg-orange-400';
    if (color === 'purple') return 'bg-purple-400';

    return 'bg-brand-primary';
};

const formatHeatmapDate = (date: string) =>
    new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric' }).format(new Date(`${date}T12:00:00`));

export function StreakCard({ streak, onEdit }: StreakCardProps) {
    const checkIn = () => {
        router.post(route('streak.check-in', streak.id), {}, { preserveScroll: true });
    };

    const deactivate = () => {
        router.patch(route('streak.deactivate', streak.id), {}, { preserveScroll: true });
    };

    return (
        <Card className="overflow-hidden border-0">
            <div className="from-brand-pale/75 via-brand-surface to-brand-surface border-brand-border/70 border-b bg-gradient-to-br p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${streakColorClass(streak.color)}`}>
                            <StreakIcon name={streak.icon} className="size-6" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold tracking-tight">{streak.name}</h2>
                            <p className="text-brand-secondary mt-1 text-sm">{streak.goal_label}</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" aria-label={`Sửa ${streak.name}`} onClick={() => onEdit(streak)}>
                            <Pencil />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" aria-label={`Tạm dừng ${streak.name}`} onClick={deactivate}>
                            <Pause />
                        </Button>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-brand-secondary text-xs font-medium tracking-[0.12em] uppercase">Đang liên tiếp</p>
                        <p className="text-brand-text mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                            {streak.current_streak} <span className="text-brand-secondary text-base font-semibold">{streak.unit_label}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {streak.activity && <Badge variant="secondary">{streak.activity.name}</Badge>}
                        <span className="text-brand-secondary inline-flex items-center gap-1 text-sm">
                            <Flame className="text-brand-streak size-4" /> Giữ nhịp nhé
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
                <div className="divide-brand-border bg-brand-background/80 grid grid-cols-3 divide-x rounded-2xl py-3 text-center">
                    <div>
                        <p className="text-brand-secondary text-xs">Hiện tại</p>
                        <p className="mt-1 text-lg font-bold">{streak.current_streak}</p>
                    </div>
                    <div>
                        <p className="text-brand-secondary text-xs">Kỷ lục</p>
                        <p className="mt-1 text-lg font-bold">{streak.best_streak}</p>
                    </div>
                    <div>
                        <p className="text-brand-secondary text-xs">Tổng lần</p>
                        <p className="mt-1 text-lg font-bold">{streak.total_check_ins}</p>
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-brand-text text-sm font-semibold">84 ngày gần đây</p>
                        <p className="text-brand-secondary text-xs">Múi giờ của bạn</p>
                    </div>
                    <div className="grid grid-cols-12 gap-1.5 sm:gap-2" aria-label={`Lịch check-in của ${streak.name}`}>
                        {streak.heatmap.map((day) => (
                            <span
                                key={day.date}
                                title={`${formatHeatmapDate(day.date)}: ${day.completed ? 'Đã hoàn thành' : 'Chưa check-in'}`}
                                aria-label={`${formatHeatmapDate(day.date)}: ${day.completed ? 'Đã hoàn thành' : 'Chưa check-in'}`}
                                className={`aspect-square rounded-[5px] ${heatmapClass(streak.color, day.completed)} ${day.is_today ? 'ring-brand-primary-dark ring-2 ring-offset-1' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" size="lg" className="flex-1" onClick={checkIn} disabled={streak.today_completed || !streak.can_check_in}>
                        {streak.today_completed ? <Check /> : <Flame />}
                        {streak.today_completed ? 'Đã check-in hôm nay' : streak.can_check_in ? 'Check-in hôm nay' : 'Không phải ngày mục tiêu'}
                    </Button>
                    {!streak.today_completed && !streak.can_check_in && (
                        <p className="text-brand-secondary flex items-center justify-center gap-1 text-xs sm:max-w-40 sm:text-left">
                            <MoreHorizontal className="size-4 shrink-0" /> Chuỗi sẽ tự bỏ qua ngày không nằm trong lịch.
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}
