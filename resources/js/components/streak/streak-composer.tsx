import InputError from '@/components/input-error';
import { StreakIcon, streakColorClass, streakColorOptions, streakIconOptions } from '@/components/streak/streak-icon';
import {
    BottomSheet,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetFooter,
    BottomSheetHeader,
    BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type MemoryOption } from '@/types/memory';
import { type StreakGoalType, type StreakItem } from '@/types/streak';
import type { FormDataConvertible } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Check, Flame, LoaderCircle } from 'lucide-react';
import { type FormEvent, useEffect } from 'react';

interface StreakFormData {
    [key: string]: FormDataConvertible;
    name: string;
    icon: string;
    color: string;
    goal_type: StreakGoalType;
    frequency: StreakFormFrequency;
    activity_id: number | null;
}

interface StreakFormFrequency {
    [key: string]: FormDataConvertible;
    days: number[];
    count: number;
}

interface StreakComposerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activities: MemoryOption[];
    streak?: StreakItem | null;
}

const weekdays = [
    { value: 1, label: 'T2' },
    { value: 2, label: 'T3' },
    { value: 3, label: 'T4' },
    { value: 4, label: 'T5' },
    { value: 5, label: 'T6' },
    { value: 6, label: 'T7' },
    { value: 7, label: 'CN' },
];

const defaultData = (): StreakFormData => ({
    name: '',
    icon: 'sparkles',
    color: 'green',
    goal_type: 'every_day',
    frequency: { days: [1, 2, 3, 4, 5, 6, 7], count: 3 },
    activity_id: null,
});

export function StreakComposer({ open, onOpenChange, activities, streak = null }: StreakComposerProps) {
    const editing = streak !== null;
    const form = useForm<StreakFormData>(
        streak
            ? {
                  name: streak.name,
                  icon: streak.icon,
                  color: streak.color,
                  goal_type: streak.goal_type,
                  frequency: {
                      days: streak.frequency?.days ?? [1, 2, 3, 4, 5, 6, 7],
                      count: streak.frequency?.count ?? 3,
                  },
                  activity_id: streak.activity?.id ?? null,
              }
            : defaultData(),
    );
    const { setData, reset, clearErrors } = form;

    useEffect(() => {
        if (!open) return;

        if (streak) {
            setData({
                name: streak.name,
                icon: streak.icon,
                color: streak.color,
                goal_type: streak.goal_type,
                frequency: {
                    days: streak.frequency?.days ?? [1, 2, 3, 4, 5, 6, 7],
                    count: streak.frequency?.count ?? 3,
                },
                activity_id: streak.activity?.id ?? null,
            });
        } else {
            reset();
        }
        clearErrors();
    }, [open, streak, setData, reset, clearErrors]);

    const toggleWeekday = (day: number) => {
        const days = form.data.frequency.days ?? [];
        form.setData('frequency', {
            ...form.data.frequency,
            days: days.includes(day) ? days.filter((item) => item !== day) : [...days, day].sort((a, b) => a - b),
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        } as const;

        if (editing && streak) {
            form.patch(route('streak.update', streak.id), options);
        } else {
            form.post(route('streak.store'), options);
        }
    };

    return (
        <BottomSheet open={open} onOpenChange={onOpenChange}>
            <BottomSheetContent className="border-brand-border bg-brand-background max-h-[92vh] overflow-y-auto rounded-t-[28px] px-4 pt-5 pb-8 sm:mx-auto sm:max-w-2xl sm:px-6">
                <BottomSheetHeader className="mx-auto w-full max-w-xl text-left">
                    <BottomSheetTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-brand-pale text-brand-primary-dark flex size-9 items-center justify-center rounded-xl">
                            <Flame className="size-4" />
                        </span>
                        {editing ? 'Chỉnh sửa chuỗi' : 'Tạo chuỗi mới'}
                    </BottomSheetTitle>
                    <BottomSheetDescription>
                        {editing ? 'Điều chỉnh mục tiêu để nhịp sống này hợp với bạn hơn.' : 'Chọn một việc nhỏ và giữ nhịp đều đặn mỗi ngày.'}
                    </BottomSheetDescription>
                </BottomSheetHeader>

                <form onSubmit={submit} className="mx-auto mt-5 w-full max-w-xl space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="streak-name">Tên chuỗi</Label>
                        <Input
                            id="streak-name"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="Ví dụ: Đọc 10 trang sách"
                            maxLength={120}
                            autoFocus
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Biểu tượng</Label>
                        <div className="grid grid-cols-7 gap-2">
                            {streakIconOptions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-label={label}
                                    aria-pressed={form.data.icon === value}
                                    onClick={() => form.setData('icon', value)}
                                    className={`flex aspect-square items-center justify-center rounded-2xl border transition-[transform,background-color,border-color,box-shadow] hover:-translate-y-0.5 ${form.data.icon === value ? 'border-brand-primary bg-brand-pale text-brand-primary-dark shadow-soft ring-brand-primary/30 ring-2' : 'border-brand-border bg-brand-surface text-brand-secondary'}`}
                                >
                                    <StreakIcon name={value} />
                                </button>
                            ))}
                        </div>
                        <InputError message={form.errors.icon} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Màu sắc</Label>
                        <div className="flex flex-wrap gap-3">
                            {streakColorOptions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-label={label}
                                    aria-pressed={form.data.color === value}
                                    onClick={() => form.setData('color', value)}
                                    className={`ring-offset-brand-background flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-2 ring-offset-2 transition ${form.data.color === value ? streakColorClass(value) : 'bg-brand-surface text-brand-secondary ring-transparent'}`}
                                >
                                    <span className="size-2.5 rounded-full bg-current" />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <InputError message={form.errors.color} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="streak-goal">Mục tiêu</Label>
                        <select
                            id="streak-goal"
                            value={form.data.goal_type}
                            onChange={(event) => form.setData('goal_type', event.target.value as StreakGoalType)}
                            className="border-brand-border bg-brand-surface text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3.5 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                        >
                            <option value="every_day">Mỗi ngày</option>
                            <option value="weekdays">Chọn ngày trong tuần</option>
                            <option value="x_days_per_week">X ngày mỗi tuần</option>
                        </select>
                        <InputError message={form.errors.goal_type} />
                    </div>

                    {form.data.goal_type === 'weekdays' && (
                        <div className="grid gap-2">
                            <Label>Ngày thực hiện</Label>
                            <div className="grid grid-cols-7 gap-2">
                                {weekdays.map((day) => {
                                    const active = (form.data.frequency.days ?? []).includes(day.value);

                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => toggleWeekday(day.value)}
                                            className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${active ? 'border-brand-primary bg-brand-pale text-brand-primary-dark' : 'border-brand-border bg-brand-surface text-brand-secondary'}`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={form.errors['frequency.days']} />
                        </div>
                    )}

                    {form.data.goal_type === 'x_days_per_week' && (
                        <div className="grid gap-2">
                            <Label htmlFor="streak-count">Số ngày mục tiêu mỗi tuần</Label>
                            <select
                                id="streak-count"
                                value={form.data.frequency.count ?? 3}
                                onChange={(event) => form.setData('frequency', { ...form.data.frequency, count: Number(event.target.value) })}
                                className="border-brand-border bg-brand-surface text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3.5 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                            >
                                {Array.from({ length: 7 }, (_, index) => index + 1).map((count) => (
                                    <option key={count} value={count}>
                                        {count} ngày
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors['frequency.count']} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="streak-activity">
                            Liên kết hoạt động <span className="text-brand-muted font-normal">(không bắt buộc)</span>
                        </Label>
                        <select
                            id="streak-activity"
                            value={form.data.activity_id ?? ''}
                            onChange={(event) => form.setData('activity_id', event.target.value ? Number(event.target.value) : null)}
                            className="border-brand-border bg-brand-surface text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3.5 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                        >
                            <option value="">Không liên kết hoạt động</option>
                            {activities.map((activity) => (
                                <option key={activity.id} value={activity.id}>
                                    {activity.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.activity_id} />
                    </div>

                    <BottomSheetFooter className="border-brand-border/70 bg-brand-background/95 sticky bottom-0 -mx-4 gap-2 border-t px-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6">
                        <Button type="submit" size="lg" className="w-full" disabled={form.processing || !form.data.name.trim()}>
                            {form.processing ? <LoaderCircle className="animate-spin" /> : <Check />}
                            {editing ? 'Lưu thay đổi' : 'Tạo chuỗi'}
                        </Button>
                    </BottomSheetFooter>
                </form>
            </BottomSheetContent>
        </BottomSheet>
    );
}
