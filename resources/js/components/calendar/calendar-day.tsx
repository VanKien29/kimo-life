import { cn } from '@/lib/utils';
import { type CalendarDay as CalendarDayData } from '@/types/calendar';
import { Images } from 'lucide-react';

interface CalendarDayProps {
    day: CalendarDayData;
    isSelected?: boolean;
    onSelect?: (day: CalendarDayData) => void;
}

export function CalendarDay({ day, isSelected, onSelect }: CalendarDayProps) {
    const hasMemory = day.memory_count > 0;
    const photos = day.photos || (day.thumbnail ? [day.thumbnail] : []);
    const hasPhoto = photos.length > 0;
    const primaryPhoto = photos[0];

    return (
        <button
            type="button"
            onClick={() => onSelect?.(day)}
            aria-label={`${day.day} tháng ${day.date.slice(5, 7)}${hasMemory ? `, ${day.memory_count} khoảnh khắc` : ', chưa có khoảnh khắc'}`}
            className={cn(
                'group relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-[8px] sm:rounded-[10px] border text-left transition-all duration-200 cursor-pointer focus:outline-hidden',
                hasPhoto
                    ? 'border-black/10 shadow-xs hover:shadow-md hover:scale-[1.02]'
                    : 'border-slate-200/70 bg-[#f7faf7] hover:bg-[#edf5ee] hover:border-slate-300',
                isSelected && 'ring-2 ring-emerald-600 ring-offset-2 scale-[1.03] z-20 shadow-md',
                day.is_today && !isSelected && 'ring-2 ring-emerald-500/80 ring-offset-1',
                day.is_future && 'opacity-40 pointer-events-none cursor-default',
            )}
        >
            {/* Background Cover Photo for Days with Photos */}
            {hasPhoto && (
                <>
                    <img
                        src={primaryPhoto.src}
                        alt={primaryPhoto.alt || ''}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                    {/* Subtle Gradient for Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40 pointer-events-none" />
                </>
            )}

            {/* Top Row: Day Number + Mood indicator */}
            <div className="relative z-10 flex items-center justify-between w-full p-1 sm:p-1.5 pointer-events-none">
                <span
                    className={cn(
                        'inline-flex items-center justify-center rounded-[5px] text-[11px] sm:text-xs font-bold leading-none transition-colors px-1 py-0.5',
                        hasPhoto
                            ? day.is_today
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-black/50 text-white backdrop-blur-xs ring-1 ring-white/20'
                            : day.is_today
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-600 group-hover:text-emerald-950 font-semibold',
                    )}
                >
                    {day.day}
                </span>

                {day.mood && (
                    <span
                        className="size-1.5 sm:size-2 rounded-full bg-amber-400 ring-1 ring-white shadow-xs"
                        aria-label="Đã ghi nhận tâm trạng"
                    />
                )}
            </div>

            {/* Bottom Row / Badges */}
            <div className="relative z-10 flex items-end justify-between w-full p-1 sm:p-1.5 pointer-events-none">
                {photos.length > 1 ? (
                    <span className="ml-auto inline-flex items-center gap-0.5 rounded-[4px] bg-black/60 px-1 py-0.5 text-[9px] sm:text-[10px] font-bold text-white backdrop-blur-xs ring-1 ring-white/20">
                        <Images className="size-2.5 sm:size-3" />
                        <span>{photos.length}</span>
                    </span>
                ) : hasMemory && !hasPhoto ? (
                    <span className="ml-auto rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
                        {day.memory_count}
                    </span>
                ) : null}
            </div>
        </button>
    );
}
