import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type ReminderItem, type ReminderPageProps } from '@/types/reminder';
import { Head, router } from '@inertiajs/react';
import { Bell, CalendarDays, Camera, Check, Clock3, Flame, Pencil, Sparkles, Target, Trash2, UsersRound, X } from 'lucide-react';
import { useState } from 'react';

const weekdays = [
    { value: 1, label: 'T2' },
    { value: 2, label: 'T3' },
    { value: 3, label: 'T4' },
    { value: 4, label: 'T5' },
    { value: 5, label: 'T6' },
    { value: 6, label: 'T7' },
    { value: 7, label: 'CN' },
];

const iconMap = { camera: Camera, target: Target, flame: Flame, users: UsersRound, calendar: CalendarDays, sparkles: Sparkles } as const;

function initialForm(timezone: string) {
    return { type: 'daily_memory', title: 'Một khoảnh khắc nhỏ', time: '21:30', days_of_week: weekdays.map((day) => day.value), timezone };
}

function daysLabel(days: number[]): string {
    if (days.length === 7) return 'Mỗi ngày';
    if (days.length === 5 && days.every((day) => day <= 5)) return 'Các ngày trong tuần';
    return days.map((day) => weekdays.find((item) => item.value === day)?.label).filter(Boolean).join(' · ');
}

export default function RemindersIndex({ reminders, types, timezone, status }: ReminderPageProps) {
    const [form, setForm] = useState(() => initialForm(timezone));
    const [editing, setEditing] = useState<ReminderItem | null>(null);

    const selectedType = types[form.type];
    const Icon = iconMap[selectedType?.icon as keyof typeof iconMap] ?? Bell;

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => { setEditing(null); setForm(initialForm(timezone)); } };
        if (editing) {
            router.patch(route('reminders.update', editing.id), form, options);
        } else {
            router.post(route('reminders.store'), form, options);
        }
    };

    const startEditing = (reminder: ReminderItem) => {
        setEditing(reminder);
        setForm({ type: reminder.type, title: reminder.title, time: reminder.time, days_of_week: reminder.days_of_week, timezone: reminder.timezone });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleDay = (day: number) => setForm((current) => ({ ...current, days_of_week: current.days_of_week.includes(day) ? current.days_of_week.filter((value) => value !== day) : [...current.days_of_week, day].sort((a, b) => a - b) }));

    return (
        <AppLayout>
            <Head title="Lời nhắc" />
            <div className="mx-auto max-w-3xl space-y-5 py-2 sm:py-4">
                {status && <Toast title={status} />}
                <div>
                    <p className="text-brand-primary-dark text-sm font-semibold">Nhịp nhỏ mỗi ngày</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Lời nhắc</h1>
                    <p className="text-brand-secondary mt-1 text-sm">Chọn thời điểm phù hợp để Kimo Life nhắc bạn thật nhẹ nhàng.</p>
                </div>

                <Card className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-brand-pale text-brand-primary-dark flex size-10 shrink-0 items-center justify-center rounded-2xl"><Icon className="size-5" /></div>
                        <div><h2 className="font-semibold">{editing ? 'Chỉnh sửa lời nhắc' : 'Tạo lời nhắc mới'}</h2><p className="text-brand-secondary mt-1 text-sm">{selectedType?.description ?? 'Một lời nhắc vừa đủ cho bạn.'}</p></div>
                    </div>
                    <form onSubmit={submit} className="mt-5 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-1.5 text-sm font-medium">Loại lời nhắc<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} className="border-brand-border bg-brand-surface text-brand-text mt-1 h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-brand-primary">{Object.entries(types).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></label>
                            <label className="space-y-1.5 text-sm font-medium">Tên hiển thị<Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ví dụ: Khoảnh khắc mỗi ngày" maxLength={120} required /></label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-1.5 text-sm font-medium">Thời gian<Input type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} required /></label>
                            <div><p className="text-sm font-medium">Ngày lặp</p><div className="mt-2 flex gap-1.5">{weekdays.map((day) => <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`size-9 rounded-full text-xs font-semibold transition-colors ${form.days_of_week.includes(day.value) ? 'bg-brand-primary text-white' : 'bg-brand-pale text-brand-secondary'}`} aria-pressed={form.days_of_week.includes(day.value)}>{day.label}</button>)}</div><p className="text-brand-muted mt-1 text-xs">{daysLabel(form.days_of_week)}</p></div>
                        </div>
                        <div className="bg-brand-pale/60 text-brand-secondary flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"><Clock3 className="size-4 shrink-0" />Múi giờ: <span className="font-semibold">{timezone}</span> · Lời nhắc sẽ theo giờ địa phương của bạn.</div>
                        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={form.days_of_week.length === 0}><Check />{editing ? 'Lưu thay đổi' : 'Tạo lời nhắc'}</Button>{editing && <Button type="button" variant="ghost" onClick={() => { setEditing(null); setForm(initialForm(timezone)); }}><X /> Hủy chỉnh sửa</Button>}</div>
                    </form>
                </Card>

                <section className="space-y-3" aria-label="Danh sách lời nhắc">
                    <div className="flex items-center justify-between"><h2 className="font-semibold">Lời nhắc của bạn</h2><span className="text-brand-secondary text-sm">{reminders.length} lời nhắc</span></div>
                    {reminders.length === 0 ? <Card className="text-brand-secondary flex flex-col items-center gap-2 p-10 text-center"><Bell className="text-brand-primary-dark size-8" /><p>Chưa có lời nhắc nào.</p><p className="text-brand-muted text-sm">Một lời nhắc nhỏ có thể giúp ngày của bạn đều đặn hơn.</p></Card> : reminders.map((reminder) => { const reminderType = types[reminder.type]; const ReminderIcon = iconMap[reminderType?.icon as keyof typeof iconMap] ?? Bell; return <Card key={reminder.id} className={`flex items-center gap-3 p-4 ${!reminder.enabled ? 'opacity-60' : ''}`}><div className="bg-brand-pale text-brand-primary-dark flex size-11 shrink-0 items-center justify-center rounded-2xl"><ReminderIcon className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{reminder.title}</h3><span className="text-brand-secondary text-xs">{reminderType?.label}</span></div><p className="text-brand-secondary mt-1 text-sm"><span className="text-brand-text font-semibold">{reminder.time}</span> · {daysLabel(reminder.days_of_week)} · {reminder.timezone}</p></div><div className="flex shrink-0 items-center gap-1"><Button type="button" variant="ghost" size="icon" aria-label={reminder.enabled ? 'Tạm dừng lời nhắc' : 'Bật lời nhắc'} onClick={() => router.patch(route('reminders.toggle', reminder.id), {}, { preserveScroll: true })}><span className={`size-2.5 rounded-full ${reminder.enabled ? 'bg-brand-primary' : 'bg-brand-muted'}`} /></Button><Button type="button" variant="ghost" size="icon" aria-label="Chỉnh sửa lời nhắc" onClick={() => startEditing(reminder)}><Pencil /></Button><Button type="button" variant="ghost" size="icon" aria-label="Xóa lời nhắc" onClick={() => window.confirm('Bạn có chắc muốn xóa lời nhắc này?') && router.delete(route('reminders.destroy', reminder.id), { preserveScroll: true })}><Trash2 className="text-brand-danger" /></Button></div></Card>; })}
                </section>
            </div>
        </AppLayout>
    );
}
