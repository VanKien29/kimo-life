import { CalendarDay } from '@/components/calendar/calendar-day';
import { CalendarHeader } from '@/components/calendar/calendar-header';
import { CalendarLegend } from '@/components/calendar/calendar-legend';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import AppLayout from '@/layouts/app-layout';
import { pageMotion } from '@/lib/motion';
import { type CalendarDay as CalendarDayType, type CalendarPageProps, type CalendarPhoto } from '@/types/calendar';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, MapPin, Plus, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function Calendar({ calendar, days }: CalendarPageProps) {
    const reduceMotion = useReducedMotion();

    // Default selected day to today, or first day with photos, or the first day
    const [selectedDay, setSelectedDay] = useState<CalendarDayType>(() => {
        return (
            days.find((d) => d.is_today) ||
            days.find((d) => (d.photos && d.photos.length > 0) || d.memory_count > 0) ||
            days[0]
        );
    });

    const selectedPhotos: CalendarPhoto[] = selectedDay?.photos?.length
        ? selectedDay.photos
        : selectedDay?.thumbnail
          ? [{ ...selectedDay.thumbnail, id: undefined, caption: null }]
          : [];

    return (
        <AppLayout>
            <Head title="Lịch" />

            <div className="space-y-6 py-2 sm:space-y-8 sm:py-4">
                <motion.div initial={reduceMotion ? false : 'initial'} animate="animate" variants={pageMotion}>
                    <CalendarHeader label={calendar.label} previous={calendar.previous} next={calendar.next} />
                </motion.div>

                {/* Calendar Grid Card */}
                <Card className="border-0 p-3 sm:p-5 shadow-sm">
                    <div className="grid grid-cols-7 gap-1.5 pb-2 sm:gap-2 text-center">
                        {weekdays.map((weekday) => (
                            <span key={weekday} className="text-brand-secondary py-1 text-center text-[11px] font-semibold sm:text-xs">
                                {weekday}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label={`Lịch ${calendar.label}`}>
                        {Array.from({ length: calendar.leading_empty_days }).map((_, index) => (
                            <span key={`empty-${index}`} aria-hidden="true" className="aspect-square w-full" />
                        ))}
                        {days.map((day) => (
                            <CalendarDay
                                key={day.date}
                                day={day}
                                isSelected={selectedDay?.date === day.date}
                                onSelect={(d) => setSelectedDay(d)}
                            />
                        ))}
                    </div>

                    {/* Interactive Selected Day Quick Preview Strip */}
                    {selectedDay && (
                        <div className="mt-4 rounded-xl border border-emerald-900/10 bg-[#f4f9f5] p-3.5 sm:p-4.5 transition-all">
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays className="size-4 text-emerald-700" />
                                        <span className="text-sm font-bold text-slate-800">
                                            Ngày {selectedDay.day} tháng {calendar.month}, {calendar.year}
                                        </span>
                                    </div>

                                    {selectedDay.is_today && (
                                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                            Hôm nay
                                        </span>
                                    )}

                                    {selectedDay.mood && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 border border-amber-200/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                            <span className="size-1.5 rounded-full bg-amber-500" />
                                            Tâm trạng: {selectedDay.mood}
                                        </span>
                                    )}

                                    {selectedDay.location && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                            <MapPin className="size-3 text-slate-400" />
                                            {selectedDay.location}
                                        </span>
                                    )}
                                </div>

                                <Link
                                    href={`/calendar/day/${selectedDay.date}`}
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-600/20 bg-white px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 hover:border-emerald-500 transition-colors"
                                >
                                    Xem chi tiết
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </div>

                            {/* Memories Content */}
                            {selectedPhotos.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedDay.title && (
                                        <p className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                                            "{selectedDay.title}"
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                                        {selectedPhotos.map((photo, i) => (
                                            <Link
                                                key={photo.id || i}
                                                href={`/calendar/day/${selectedDay.date}`}
                                                className="group/item relative shrink-0 aspect-[4/3] w-28 sm:w-36 overflow-hidden rounded-lg border border-white bg-white shadow-2xs transition-all hover:scale-102 hover:shadow-md"
                                            >
                                                <img
                                                    src={photo.src}
                                                    alt={photo.alt || ''}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                                {photo.caption && (
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1.5">
                                                        <p className="text-[10px] text-white line-clamp-1">
                                                            {photo.caption}
                                                        </p>
                                                    </div>
                                                )}
                                            </Link>
                                        ))}

                                        {selectedDay.memory_count > selectedPhotos.length && (
                                            <Link
                                                href={`/calendar/day/${selectedDay.date}`}
                                                className="shrink-0 flex flex-col items-center justify-center aspect-[4/3] w-20 sm:w-24 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/70 transition-colors text-center p-2"
                                            >
                                                <Sparkles className="size-4 mb-1 text-emerald-600" />
                                                <span className="text-[10px] font-bold">
                                                    +{selectedDay.memory_count - selectedPhotos.length} ảnh khác
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ) : selectedDay.memory_count > 0 ? (
                                <div className="flex items-center justify-between gap-2 py-1">
                                    <p className="text-xs sm:text-sm text-slate-700">
                                        Có {selectedDay.memory_count} khoảnh khắc được ghi lại trong ngày này.
                                    </p>
                                    <Link
                                        href={`/calendar/day/${selectedDay.date}`}
                                        className="text-xs font-semibold text-emerald-700 hover:underline"
                                    >
                                        Xem ngay →
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 py-1">
                                    <p className="text-xs sm:text-sm text-slate-500">
                                        Chưa có khoảnh khắc nào trong ngày này.
                                    </p>
                                    {!selectedDay.is_future && (
                                        <Link
                                            href="/memory?compose=1"
                                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                                        >
                                            <Plus className="size-3.5" />
                                            Thêm khoảnh khắc
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <CalendarLegend />

                <motion.section
                    initial={reduceMotion ? false : 'initial'}
                    animate="animate"
                    variants={pageMotion}
                    className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
                >
                    <Card className="border-0 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="bg-brand-pale text-brand-primary-dark rounded-xl p-2.5">
                                <CalendarDays className="size-5" />
                            </span>
                            <div>
                                <h2 className="text-brand-text text-lg font-bold">Giữ lại nhịp sống của bạn</h2>
                                <p className="text-brand-secondary mt-1 text-sm leading-6">
                                    Chạm vào một ngày trên lịch để xem nhanh ảnh hoặc bấm vào từng ngày để xem chi tiết.
                                </p>
                            </div>
                        </div>
                        <Link href="/memory" className="text-brand-primary-dark mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                            Xem tất cả khoảnh khắc
                            <ArrowRight className="size-4" />
                        </Link>
                    </Card>

                    <EmptyState
                        title="Muốn thêm một ngày đáng nhớ?"
                        description="Một tấm ảnh hôm nay là đủ để bắt đầu."
                        className="px-5 py-6"
                        action={
                            <Link
                                href="/memory?compose=1"
                                className="bg-brand-primary text-white shadow-soft hover:bg-brand-primary-dark inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors"
                            >
                                <Plus className="size-4" />
                                Thêm khoảnh khắc
                            </Link>
                        }
                    />
                </motion.section>
            </div>
        </AppLayout>
    );
}
