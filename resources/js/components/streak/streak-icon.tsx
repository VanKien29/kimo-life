import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Code2, Coffee, Dumbbell, Footprints, Gamepad2, Sparkles } from 'lucide-react';

export const streakIconOptions = [
    { value: 'sparkles', label: 'Lấp lánh', Icon: Sparkles },
    { value: 'book-open', label: 'Đọc sách', Icon: BookOpen },
    { value: 'dumbbell', label: 'Tập luyện', Icon: Dumbbell },
    { value: 'footprints', label: 'Đi bộ', Icon: Footprints },
    { value: 'coffee', label: 'Cà phê', Icon: Coffee },
    { value: 'code', label: 'Lập trình', Icon: Code2 },
    { value: 'gamepad-2', label: 'Giải trí', Icon: Gamepad2 },
] as const;

export const streakColorOptions = [
    { value: 'green', label: 'Xanh lá', className: 'bg-brand-pale text-brand-primary-dark ring-brand-primary' },
    { value: 'blue', label: 'Xanh dương', className: 'bg-brand-blue/25 text-blue-900 ring-blue-500' },
    { value: 'orange', label: 'Cam', className: 'bg-brand-accent/45 text-orange-900 ring-orange-500' },
    { value: 'purple', label: 'Tím', className: 'bg-purple-100 text-purple-900 ring-purple-500' },
] as const;

const iconMap: Record<string, LucideIcon> = Object.fromEntries(streakIconOptions.map(({ value, Icon }) => [value, Icon]));

export function StreakIcon({ name, className }: { name: string; className?: string }) {
    const Icon = iconMap[name] ?? Sparkles;

    return <Icon className={cn('size-5', className)} aria-hidden="true" />;
}

export function streakColorClass(color: string) {
    return streakColorOptions.find((option) => option.value === color)?.className ?? streakColorOptions[0].className;
}
