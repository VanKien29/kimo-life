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
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type MemoryOption } from '@/types/memory';
import type { FormDataConvertible } from '@inertiajs/core';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Archive, ArrowLeft, Check, LoaderCircle, Pencil, Plus, Sparkles } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

interface ActivityItem extends MemoryOption {
    archived_at?: string | null;
}

interface ActivityFormData {
    [key: string]: FormDataConvertible;
    name: string;
    icon: string;
    color: string;
}

interface ActivityEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activity: ActivityItem | null;
}

function ActivityEditor({ open, onOpenChange, activity }: ActivityEditorProps) {
    const editing = activity !== null;
    const inertiaForm = useForm<ActivityFormData>({
        name: activity?.name ?? '',
        icon: activity?.icon ?? 'sparkles',
        color: activity?.color ?? 'green',
    });
    const { setData, clearErrors } = inertiaForm;

    useEffect(() => {
        if (!open) return;

        setData({
            name: activity?.name ?? '',
            icon: activity?.icon ?? 'sparkles',
            color: activity?.color ?? 'green',
        });
        clearErrors();
    }, [open, activity, setData, clearErrors]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) } as const;

        if (editing && activity) inertiaForm.patch(route('activities.update', activity.id), options);
        else inertiaForm.post(route('activities.store'), options);
    };

    return (
        <BottomSheet open={open} onOpenChange={onOpenChange}>
            <BottomSheetContent className="border-brand-border bg-brand-background max-h-[92vh] overflow-y-auto rounded-t-[28px] px-4 pt-5 pb-8 sm:mx-auto sm:max-w-2xl sm:px-6">
                <BottomSheetHeader className="mx-auto w-full max-w-xl text-left">
                    <BottomSheetTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-brand-pale text-brand-primary-dark flex size-9 items-center justify-center rounded-xl">
                            <Sparkles className="size-4" />
                        </span>
                        {editing ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động'}
                    </BottomSheetTitle>
                    <BottomSheetDescription>Đặt một cái tên dễ nhớ để dùng lại trong khoảnh khắc và chuỗi.</BottomSheetDescription>
                </BottomSheetHeader>

                <form onSubmit={submit} className="mx-auto mt-5 w-full max-w-xl space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="activity-name">Tên hoạt động</Label>
                        <Input
                            id="activity-name"
                            value={inertiaForm.data.name}
                            onChange={(event) => inertiaForm.setData('name', event.target.value)}
                            placeholder="Ví dụ: Đọc sách"
                            maxLength={80}
                            autoFocus
                        />
                        <InputError message={inertiaForm.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Biểu tượng</Label>
                        <div className="grid grid-cols-7 gap-2">
                            {streakIconOptions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-label={label}
                                    aria-pressed={inertiaForm.data.icon === value}
                                    onClick={() => inertiaForm.setData('icon', value)}
                                    className={`flex aspect-square items-center justify-center rounded-2xl border transition ${inertiaForm.data.icon === value ? 'border-brand-primary bg-brand-pale text-brand-primary-dark ring-brand-primary/30 ring-2' : 'border-brand-border bg-brand-surface text-brand-secondary'}`}
                                >
                                    <StreakIcon name={value} />
                                </button>
                            ))}
                        </div>
                        <InputError message={inertiaForm.errors.icon} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Màu sắc</Label>
                        <div className="flex flex-wrap gap-3">
                            {streakColorOptions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-label={label}
                                    aria-pressed={inertiaForm.data.color === value}
                                    onClick={() => inertiaForm.setData('color', value)}
                                    className={`ring-offset-brand-background flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-2 ring-offset-2 transition ${inertiaForm.data.color === value ? streakColorClass(value) : 'bg-brand-surface text-brand-secondary ring-transparent'}`}
                                >
                                    <span className="size-2.5 rounded-full bg-current" />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <InputError message={inertiaForm.errors.color} />
                    </div>

                    <BottomSheetFooter className="border-brand-border/70 bg-brand-background/95 sticky bottom-0 -mx-4 gap-2 border-t px-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6">
                        <Button type="submit" size="lg" className="w-full" disabled={inertiaForm.processing || !inertiaForm.data.name.trim()}>
                            {inertiaForm.processing ? <LoaderCircle className="animate-spin" /> : <Check />}
                            {editing ? 'Lưu thay đổi' : 'Thêm hoạt động'}
                        </Button>
                    </BottomSheetFooter>
                </form>
            </BottomSheetContent>
        </BottomSheet>
    );
}

export default function Activities({
    activities,
    archivedActivities,
    status,
}: {
    activities: ActivityItem[];
    archivedActivities: ActivityItem[];
    status?: string;
}) {
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);

    const openCreate = () => {
        setEditingActivity(null);
        setEditorOpen(true);
    };

    const openEdit = (activity: ActivityItem) => {
        setEditingActivity(activity);
        setEditorOpen(true);
    };

    const archive = (activity: ActivityItem) => {
        router.patch(route('activities.archive', activity.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Hoạt động" />

            <div className="space-y-6 py-2 sm:space-y-8 sm:py-4">
                {status && <Toast title={status} />}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Link href={route('streak')} className="text-brand-primary-dark mb-3 inline-flex items-center gap-1 text-sm font-semibold">
                            <ArrowLeft className="size-4" /> Quay lại chuỗi
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hoạt động</h1>
                        <p className="text-brand-secondary mt-2 max-w-xl text-sm leading-6 sm:text-base">
                            Tạo danh sách những việc thường xuất hiện trong ngày của bạn.
                        </p>
                    </div>
                    <Button type="button" size="icon" className="shrink-0 sm:hidden" aria-label="Thêm hoạt động" onClick={openCreate}>
                        <Plus />
                    </Button>
                    <Button type="button" className="hidden shrink-0 sm:inline-flex" onClick={openCreate}>
                        <Plus />
                        Thêm hoạt động
                    </Button>
                </div>

                {activities.length === 0 ? (
                    <EmptyState
                        title="Chưa có hoạt động nào."
                        description="Tạo hoạt động đầu tiên để liên kết với khoảnh khắc hoặc chuỗi."
                        action={
                            <Button onClick={openCreate}>
                                <Plus />
                                Thêm hoạt động
                            </Button>
                        }
                    />
                ) : (
                    <section className="grid gap-3 sm:grid-cols-2" aria-label="Hoạt động đang dùng">
                        {activities.map((activity) => (
                            <Card key={activity.id} className="border-0 p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${streakColorClass(activity.color ?? 'green')}`}
                                    >
                                        <StreakIcon name={activity.icon ?? 'sparkles'} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="truncate font-semibold">{activity.name}</h2>
                                        <p className="text-brand-secondary mt-1 text-xs">Có thể dùng cho chuỗi và khoảnh khắc</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Sửa ${activity.name}`}
                                        onClick={() => openEdit(activity)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Lưu trữ ${activity.name}`}
                                        onClick={() => archive(activity)}
                                    >
                                        <Archive />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </section>
                )}

                {archivedActivities.length > 0 && (
                    <section className="space-y-3" aria-labelledby="archived-activities-title">
                        <div>
                            <p className="text-brand-secondary text-sm font-medium">Không còn dùng thường xuyên</p>
                            <h2 id="archived-activities-title" className="mt-1 text-xl font-bold">
                                Đã lưu trữ
                            </h2>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {archivedActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="border-brand-border bg-brand-surface/60 text-brand-secondary flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                                >
                                    <Archive className="size-4" />
                                    <span>{activity.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <ActivityEditor key={editingActivity?.id ?? 'new'} open={editorOpen} onOpenChange={setEditorOpen} activity={editingActivity} />
        </AppLayout>
    );
}
