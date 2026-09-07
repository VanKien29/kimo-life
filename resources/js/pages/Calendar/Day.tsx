import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Tag } from '@/components/ui/tag';
import AppLayout from '@/layouts/app-layout';
import { pageMotion, springMotion } from '@/lib/motion';
import { type DayDetailPageProps } from '@/types/calendar';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Camera, CheckCircle2, ChevronRight, MapPin, PenLine, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export default function CalendarDayDetail({ day, memories, activities, stats }: DayDetailPageProps) {
    const reduceMotion = useReducedMotion();
    const subtitle =
        stats.memories > 0
            ? stats.mood
                ? `Một ngày ${stats.mood.label.toLocaleLowerCase()} với ${stats.memories} điều đáng nhớ.`
                : `Bạn đã giữ lại ${stats.memories} khoảnh khắc trong ngày này.`
            : 'Ngày này đang chờ một điều nhỏ được ghi lại.';

    return (
        <AppLayout>
            <Head title={`Ngày ${day.formatted}`} />

            <div className="space-y-6 py-2 sm:space-y-8 sm:py-4">
                <Link href="/calendar" className="text-brand-primary-dark inline-flex items-center gap-2 text-sm font-semibold">
                    <ArrowLeft className="size-4" />
                    Quay lại lịch
                </Link>

                {/* Day Header */}
                <motion.section
                    initial={reduceMotion ? false : 'initial'}
                    animate="animate"
                    variants={pageMotion}
                    className="relative overflow-hidden rounded-3xl bg-brand-surface px-5 py-6 shadow-soft sm:px-8 sm:py-8"
                >
                    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                        <img
                            src="/images/hero-landscape.jpg"
                            alt=""
                            className="h-full w-full object-cover object-right sm:object-center opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-surface/95 via-brand-surface/80 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <p className="text-brand-primary-dark text-sm font-medium">{day.weekday}</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{day.formatted}</h1>
                        <p className="text-brand-secondary mt-2 text-sm leading-6 sm:text-base">
                            "{subtitle}"
                        </p>
                    </div>
                </motion.section>

                {/* Stats */}
                <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Tổng quan trong ngày">
                    <SummaryCard label="Khoảnh khắc" value={stats.memories} icon={Camera} iconColor="text-amber-500" iconBg="bg-amber-50" />
                    <SummaryCard label="Hoạt động" value={stats.activities} icon={CheckCircle2} iconColor="text-brand-primary-dark" iconBg="bg-brand-pale" />
                    <SummaryCard
                        label="Tâm trạng"
                        value={stats.mood ? `${stats.mood.emoji} ${stats.mood.label}` : 'Chưa chọn'}
                        icon={Sparkles}
                        compact
                        iconColor="text-rose-500"
                        iconBg="bg-rose-50"
                    />
                </section>

                {/* Activities */}
                {activities.length > 0 && (
                    <Card className="border-0 p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-brand-primary-dark text-sm font-medium">Dấu mốc trong ngày</p>
                                <h2 className="mt-1 text-xl font-bold tracking-tight">Bạn đã làm gì?</h2>
                            </div>
                            <CheckCircle2 className="text-brand-primary-dark size-5" />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {activities.map((activity) => (
                                <Tag key={activity.id}>
                                    <CheckCircle2 className="mr-1.5 size-3.5" />
                                    {activity.name}
                                </Tag>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Timeline — Vertical with time labels like mockup */}
                <section aria-labelledby="day-timeline-title">
                    <div className="mb-4 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-brand-primary-dark text-sm font-medium">Dòng thời gian</p>
                            <h2 id="day-timeline-title" className="mt-1 text-xl font-bold tracking-tight">
                                Những điều đã giữ lại
                            </h2>
                        </div>
                        <Link href="/memory" className="text-brand-primary-dark inline-flex items-center gap-1 text-sm font-semibold">
                            Khoảnh khắc
                            <ChevronRight className="size-4" />
                        </Link>
                    </div>

                    {memories.length === 0 ? (
                        <EmptyState
                            title="Ngày này vẫn còn trống."
                            description="Một tấm ảnh hoặc một dòng ngắn cũng đủ để lưu lại hôm nay."
                            action={
                                <Button asChild>
                                    <Link href="/memory?compose=1">
                                        <PenLine />
                                        Thêm khoảnh khắc
                                    </Link>
                                </Button>
                            }
                        />
                    ) : (
                        <div className="relative space-y-4 sm:space-y-5">
                            {/* Timeline line */}
                            <div className="absolute top-4 bottom-4 left-[18px] w-px bg-brand-border" aria-hidden="true" />

                            {memories.map((memory, index) => (
                                <motion.article
                                    key={memory.id}
                                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ ...springMotion, delay: index * 0.04 }}
                                    className="relative pl-12"
                                >
                                    {/* Timeline dot */}
                                    <span className="bg-brand-primary text-white shadow-soft ring-brand-background absolute top-2 left-0 flex size-9 items-center justify-center rounded-full ring-4">
                                        <Camera className="size-4" />
                                    </span>

                                    {/* Time label */}
                                    <time className="text-brand-primary-dark text-sm font-bold" dateTime={memory.created_at ?? undefined}>
                                        {memory.time_label ?? 'Trong ngày'}
                                    </time>

                                    {/* Memory Card */}
                                    <Link
                                        href={`/memory/${memory.id}`}
                                        className="border-brand-border bg-brand-surface hover:border-brand-primary mt-2 block overflow-hidden rounded-2xl border transition-colors"
                                    >
                                        {memory.photos.length > 0 ? (
                                            <img
                                                src={memory.photos[0].src}
                                                alt={memory.photos[0].alt}
                                                loading="lazy"
                                                className="aspect-[16/8] w-full object-cover"
                                            />
                                        ) : (
                                            <div className="bg-brand-pale text-brand-primary-dark flex aspect-[16/8] items-center justify-center">
                                                <PenLine className="size-7" />
                                            </div>
                                        )}
                                        <div className="space-y-2 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-brand-text line-clamp-2 font-semibold">
                                                    {memory.title || memory.content?.split('\n')[0] || 'Một khoảnh khắc nhỏ'}
                                                </h3>
                                                <ChevronRight className="text-brand-muted mt-0.5 size-4 shrink-0" />
                                            </div>
                                            {memory.content && memory.title && (
                                                <p className="text-brand-secondary line-clamp-3 text-sm leading-6">{memory.content}</p>
                                            )}
                                            {(memory.location || memory.activities.length > 0) && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {memory.location && (
                                                        <Tag tone="neutral">
                                                            <MapPin className="mr-1 size-3.5" />
                                                            {memory.location}
                                                        </Tag>
                                                    )}
                                                    {memory.activities.slice(0, 2).map((activity) => (
                                                        <Tag key={activity.id}>#{activity.name}</Tag>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Add More CTA */}
                <Card className="bg-brand-pale/50 border-0 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-6">
                    <div>
                        <p className="text-brand-primary-dark text-sm font-semibold">Muốn thêm điều gì cho ngày này?</p>
                        <p className="text-brand-secondary mt-1 text-sm">Bạn chỉ cần một tấm ảnh và một chú thích ngắn.</p>
                    </div>
                    <Button asChild className="mt-4 sm:mt-0">
                        <Link href="/memory?compose=1">
                            <PenLine />
                            Thêm khoảnh khắc
                        </Link>
                    </Button>
                </Card>
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
    compact = false,
    iconColor = 'text-brand-primary-dark',
    iconBg = 'bg-brand-pale',
}: {
    label: string;
    value: number | string;
    icon: typeof Camera;
    compact?: boolean;
    iconColor?: string;
    iconBg?: string;
}) {
    return (
        <Card className="border-0 p-3 sm:p-5">
            <div className="flex items-center gap-2">
                <span className={`flex size-8 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`size-4 ${iconColor}`} />
                </span>
                <span className="text-[11px] font-medium text-brand-secondary sm:text-sm">{label}</span>
            </div>
            <p className={`text-brand-text mt-2 font-bold ${compact ? 'text-sm sm:text-base' : 'text-2xl sm:text-3xl'}`}>{value}</p>
        </Card>
    );
}
