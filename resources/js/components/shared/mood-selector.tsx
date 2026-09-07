import { cn } from '@/lib/utils';

const moods = [
    { value: 1, emoji: '😞', label: 'Tệ', color: '#ef4444' },
    { value: 2, emoji: '😐', label: 'Không tốt', color: '#f97316' },
    { value: 3, emoji: '🙂', label: 'Bình thường', color: '#eab308' },
    { value: 4, emoji: '😊', label: 'Tốt', color: '#74C69D' },
    { value: 5, emoji: '🤩', label: 'Tuyệt vời', color: '#3f8f6b' },
] as const;

interface MoodSelectorProps {
    value?: number | null;
    onChange?: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function MoodSelector({ value, onChange, size = 'md', className }: MoodSelectorProps) {
    const sizeClasses = {
        sm: 'text-xl gap-2',
        md: 'text-3xl gap-3',
        lg: 'text-4xl gap-4',
    };

    const labelSize = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
    };

    return (
        <div className={cn('flex items-center justify-center', sizeClasses[size], className)} role="radiogroup" aria-label="Chọn tâm trạng">
            {moods.map((mood) => {
                const active = value === mood.value;
                const hasSelection = value !== null && value !== undefined;

                return (
                    <button
                        key={mood.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={mood.label}
                        onClick={() => onChange?.(mood.value)}
                        className="kimo-mood-option flex flex-col items-center gap-1"
                        data-active={hasSelection ? String(active) : undefined}
                    >
                        <span className={cn(
                            'flex items-center justify-center rounded-full transition-all duration-200',
                            size === 'sm' && 'size-9',
                            size === 'md' && 'size-12',
                            size === 'lg' && 'size-14',
                        )}
                            style={active ? { boxShadow: `0 0 0 2px ${mood.color}, 0 0 0 4px var(--kimo-background)`, backgroundColor: `${mood.color}15` } : undefined}
                        >
                            {mood.emoji}
                        </span>
                        <span className={cn(
                            'font-medium transition-colors',
                            labelSize[size],
                            active ? 'text-brand-primary-dark' : 'text-brand-secondary',
                        )}>
                            {mood.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export { moods };
