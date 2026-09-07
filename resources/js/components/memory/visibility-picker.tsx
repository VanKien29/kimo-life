import { cn } from '@/lib/utils';
import { Globe2, LockKeyhole, UsersRound } from 'lucide-react';

const options = [
    { value: 'private', label: 'Riêng tư', description: 'Chỉ mình bạn', icon: LockKeyhole },
    { value: 'friends', label: 'Bạn bè', description: 'Bạn bè đã kết nối', icon: UsersRound },
    { value: 'public', label: 'Công khai', description: 'Mọi người có thể xem', icon: Globe2 },
] as const;

interface VisibilityPickerProps {
    value: string;
    onChange: (value: 'private' | 'friends' | 'public') => void;
}

export function VisibilityPicker({ value, onChange }: VisibilityPickerProps) {
    return (
        <div className="grid gap-2 sm:grid-cols-3" aria-label="Chọn quyền riêng tư">
            {options.map((option) => {
                const Icon = option.icon;
                const active = value === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'flex items-center gap-3 rounded-2xl border p-3 text-left transition-[background-color,border-color,box-shadow,transform] active:scale-[0.99]',
                            active ? 'border-brand-primary bg-brand-pale shadow-soft' : 'border-brand-border bg-brand-surface hover:bg-brand-pale/50',
                        )}
                    >
                        <Icon className={cn('size-4 shrink-0', active ? 'text-brand-primary-dark' : 'text-brand-secondary')} />
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold">{option.label}</span>
                            <span className="text-brand-secondary block text-xs">{option.description}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
