import { cn } from '@/lib/utils';

export const moodOptions = [
    { value: 'vui', label: 'Vui', emoji: '😊' },
    { value: 'binh-yen', label: 'Bình yên', emoji: '🌿' },
    { value: 'biet-on', label: 'Biết ơn', emoji: '💛' },
    { value: 'hao-hung', label: 'Hào hứng', emoji: '✨' },
    { value: 'met', label: 'Hơi mệt', emoji: '🌙' },
] as const;

interface MoodPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
    return (
        <div className="flex flex-wrap gap-2" aria-label="Chọn tâm trạng">
            {moodOptions.map((mood) => {
                const active = value === mood.value;

                return (
                    <button
                        key={mood.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(active ? '' : mood.value)}
                        className={cn(
                            'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition-[background-color,border-color,transform] active:scale-[0.98]',
                            active ? 'border-brand-primary bg-brand-pale' : 'border-brand-border bg-brand-surface hover:bg-brand-pale/60',
                        )}
                    >
                        <span aria-hidden="true">{mood.emoji}</span>
                        {mood.label}
                    </button>
                );
            })}
        </div>
    );
}
