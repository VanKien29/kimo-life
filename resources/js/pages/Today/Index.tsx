import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { queueMemoryPhotos } from '@/lib/memory-quick-capture';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type TodayPageProps, type TodayPhotoItem } from '@/types/today';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Camera, Check, ChevronRight, Flame, PenLine, Plus, Smile, Sprout, UsersRound } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Today({
    today,
    todayPhotos = [],
    activeHabits = [],
    togetherSummary = { friendsCount: 0, duoCount: 0 },
    stats,
}: TodayPageProps) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<TodayPhotoItem | null>(null);
    const [checkingInId, setCheckingInId] = useState<number | null>(null);

    const firstName = auth.user.name.trim().split(' ').pop() || auth.user.name;

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            queueMemoryPhotos(Array.from(files));
            router.visit(`/memory?compose=1&capture=${Date.now()}`);
        }
    };

    const handleCheckIn = (streakId: number) => {
        setCheckingInId(streakId);
        router.post(
            `/streak/${streakId}/check-in`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setCheckingInId(null),
            },
        );
    };

    /**
     * Map today's photos to 5 slots with the hero photo placed in the center (slot 2)
     * and missing slots remaining null (rendered as default gray + cards).
     */
    const slots: (TodayPhotoItem | null)[] = [null, null, null, null, null];
    const count = Math.min(todayPhotos.length, 5);

    if (count === 1) {
        slots[2] = todayPhotos[0];
    } else if (count === 2) {
        slots[1] = todayPhotos[0];
        slots[2] = todayPhotos[1];
    } else if (count === 3) {
        slots[1] = todayPhotos[0];
        slots[2] = todayPhotos[1];
        slots[3] = todayPhotos[2];
    } else if (count === 4) {
        slots[0] = todayPhotos[0];
        slots[1] = todayPhotos[1];
        slots[2] = todayPhotos[2];
        slots[3] = todayPhotos[3];
    } else if (count >= 5) {
        slots[0] = todayPhotos[0];
        slots[1] = todayPhotos[1];
        slots[2] = todayPhotos[2];
        slots[3] = todayPhotos[3];
        slots[4] = todayPhotos[4];
    }

    const cardConfigs = [
        {
            // Slot 0 (far left - leaning out)
            rotation: '-rotate-[11deg]',
            translateY: 'translate-y-2.5',
            scale: 'scale-[0.88]',
            zIndex: 'z-10',
            origin: 'origin-bottom-right',
            extra: 'shadow-sm',
        },
        {
            // Slot 1 (inner left - leaning slight left)
            rotation: '-rotate-[5deg]',
            translateY: 'translate-y-1',
            scale: 'scale-[0.95]',
            zIndex: 'z-20',
            origin: 'origin-bottom',
            extra: 'shadow-sm',
        },
        {
            // Slot 2 (center - straight & prominent, no square border rings)
            rotation: 'rotate-0',
            translateY: 'translate-y-0',
            scale: 'scale-105 sm:scale-110',
            zIndex: 'z-30',
            origin: 'origin-bottom',
            extra: 'shadow-md shadow-emerald-950/20',
        },
        {
            // Slot 3 (inner right - leaning slight right)
            rotation: 'rotate-[5deg]',
            translateY: 'translate-y-1',
            scale: 'scale-[0.95]',
            zIndex: 'z-20',
            origin: 'origin-bottom',
            extra: 'shadow-sm',
        },
        {
            // Slot 4 (far right - leaning out)
            rotation: 'rotate-[11deg]',
            translateY: 'translate-y-2.5',
            scale: 'scale-[0.88]',
            zIndex: 'z-10',
            origin: 'origin-bottom-left',
            extra: 'shadow-sm',
        },
    ];

    return (
        <AppLayout>
            <Head title="Trang chủ" />

            {/* Hidden file input for quick photo uploading */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
            />

            {/* Main content container strictly matching the mobile mockup */}
            <div className="mx-auto w-full max-w-md space-y-5 px-1 py-2 sm:max-w-lg sm:space-y-6 sm:py-4">
                {/* 1. Greeting Banner with Cozy Pine Trees Illustration */}
                <section className="relative flex items-center justify-between pt-1">
                    <div className="z-10 flex-1 pr-2">
                        <h1 className="text-[26px] font-extrabold tracking-tight text-[#112419] sm:text-3xl">
                            Chào buổi sáng,<br />
                            <span className="inline-flex items-center gap-1.5">
                                {firstName}!
                                <span className="inline-block origin-bottom-right transition-transform hover:rotate-12 select-none">
                                    👋
                                </span>
                            </span>
                        </h1>
                        <p className="mt-2 text-xs font-normal leading-relaxed text-[#5a7263] sm:text-sm">
                            Hôm nay cũng là một ngày tuyệt vời để tiến bộ!
                        </p>
                    </div>

                    {/* Cozy Watercolor Pine Trees & Hill Illustration */}
                    <div className="relative -mr-2 w-36 shrink-0 sm:w-44 select-none pointer-events-none">
                        <NatureHeaderIllustration />
                    </div>
                </section>

                {/* 2. Date & Weather Card */}
                <section className="flex items-center justify-between rounded-[26px] border border-[#e8f0ea] bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:px-6 sm:py-5">
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-[#6c8273] sm:text-sm">
                            {today.weekday}
                        </p>
                        <p className="mt-0.5 text-xl font-bold tracking-tight text-[#142d3f] sm:text-2xl">
                            {today.formatted}
                        </p>
                    </div>

                    {/* Cute Warm Golden Sun with Rounded Rays */}
                    <div className="flex size-12 shrink-0 items-center justify-center sm:size-14" aria-label="Thời tiết nắng">
                        <svg viewBox="0 0 48 48" className="size-11 sm:size-12 drop-shadow-sm" fill="none">
                            <circle cx="24" cy="24" r="9.5" fill="#f59e0b" />
                            <g stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round">
                                <line x1="24" y1="5" x2="24" y2="9" />
                                <line x1="24" y1="39" x2="24" y2="43" />
                                <line x1="5" y1="24" x2="9" y2="24" />
                                <line x1="39" y1="24" x2="43" y2="24" />
                                <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" />
                                <line x1="34.5" y1="34.5" x2="37.5" y2="37.5" />
                                <line x1="10.5" y1="37.5" x2="13.5" y2="34.5" />
                                <line x1="34.5" y1="13.5" x2="37.5" y2="10.5" />
                            </g>
                        </svg>
                    </div>
                </section>

                {/* 3. 4 Quick Action Buttons */}
                <section className="grid grid-cols-4 gap-2 pt-1 text-center sm:gap-3">
                    {/* Thêm ảnh */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex flex-col items-center focus:outline-none"
                    >
                        <div className="flex size-14 items-center justify-center rounded-[22px] bg-[#ebf6ee] text-[#1c7e47] shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#dff0e4] active:scale-95 sm:size-16">
                            <Camera className="size-6 stroke-[1.9] sm:size-7" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-[#4b6354] transition-colors group-hover:text-[#1c7e47] sm:text-[13px]">
                            Thêm ảnh
                        </span>
                    </button>

                    {/* Ghi chú */}
                    <Link
                        href="/memory?compose=1"
                        className="group flex flex-col items-center focus:outline-none"
                    >
                        <div className="flex size-14 items-center justify-center rounded-[22px] bg-[#ebf6ee] text-[#1c7e47] shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#dff0e4] active:scale-95 sm:size-16">
                            <PenLine className="size-6 stroke-[1.9] sm:size-7" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-[#4b6354] transition-colors group-hover:text-[#1c7e47] sm:text-[13px]">
                            Ghi chú
                        </span>
                    </Link>

                    {/* Thói quen */}
                    <Link
                        href="/streak"
                        className="group flex flex-col items-center focus:outline-none"
                    >
                        <div className="flex size-14 items-center justify-center rounded-[22px] bg-[#ebf6ee] text-[#1c7e47] shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#dff0e4] active:scale-95 sm:size-16">
                            <Sprout className="size-6 stroke-[1.9] sm:size-7" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-[#4b6354] transition-colors group-hover:text-[#1c7e47] sm:text-[13px]">
                            Thói quen
                        </span>
                    </Link>

                    {/* Tâm trạng */}
                    <Link
                        href="/memory?compose=1&advanced=1"
                        className="group flex flex-col items-center focus:outline-none"
                    >
                        <div className="flex size-14 items-center justify-center rounded-[22px] bg-[#ebf6ee] text-[#1c7e47] shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#dff0e4] active:scale-95 sm:size-16">
                            <Smile className="size-6 stroke-[1.9] sm:size-7" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-[#4b6354] transition-colors group-hover:text-[#1c7e47] sm:text-[13px]">
                            Tâm trạng
                        </span>
                    </Link>
                </section>

                {/* 4. Khoảnh khắc hôm nay: 5-Photo Fan Deck (NO square border) */}
                <section className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold tracking-tight text-[#142838] sm:text-xl">
                            Khoảnh khắc hôm nay
                        </h2>
                        <Link
                            href="/memory"
                            className="inline-flex items-center text-xs font-medium text-slate-400 transition-colors hover:text-emerald-700 sm:text-sm"
                        >
                            Xem tất cả
                            <ChevronRight className="size-3.5" />
                        </Link>
                    </div>

                    {/* 5-Photo Fan/Coverflow Stack */}
                    <div className="relative mx-auto flex w-full max-w-sm items-center justify-center -space-x-2.5 py-4 sm:max-w-md sm:-space-x-3.5">
                        {slots.map((photo, index) => {
                            const config = cardConfigs[index];

                            return (
                                <div
                                    key={photo?.id || `empty-slot-${index}`}
                                    className={cn(
                                        'relative aspect-[3/4] w-[22%] max-w-[80px] shrink-0 rounded-2xl transition-all duration-300 sm:max-w-[94px]',
                                        config.rotation,
                                        config.translateY,
                                        config.scale,
                                        config.zIndex,
                                        config.origin,
                                        config.extra,
                                        'hover:z-40 hover:-translate-y-1 hover:rotate-0 hover:scale-105',
                                    )}
                                >
                                    {photo ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPhoto(photo)}
                                            aria-label={photo.title || 'Khoảnh khắc hôm nay'}
                                            className="group relative h-full w-full overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition-all duration-200 focus:outline-none"
                                        >
                                            <img
                                                src={photo.src}
                                                alt={photo.alt || 'Khoảnh khắc hôm nay'}
                                                className="h-full w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        </button>
                                    ) : (
                                        /* Default gray card with plus sign (+) for empty slots */
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            aria-label="Thêm ảnh cho khoảnh khắc này"
                                            className="group relative flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/90 text-slate-400 shadow-xs transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/60 hover:text-emerald-700 active:scale-95 focus:outline-none"
                                        >
                                            <div className="flex size-7 items-center justify-center rounded-full bg-white/90 shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:bg-emerald-100">
                                                <Plus className="size-4 stroke-[2.5]" />
                                            </div>
                                            <span className="mt-1 text-[10px] font-medium text-slate-400 transition-colors group-hover:text-emerald-700">
                                                Thêm
                                            </span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 5. NEW SECTION: Chuỗi ngày & Điểm danh nhanh (Streak & One-tap check-in) */}
                <section className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                            <span className="flex size-6 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                <Flame className="size-3.5 fill-orange-500 text-orange-500" />
                            </span>
                            <h2 className="text-base font-bold tracking-tight text-[#142838] sm:text-lg">
                                Chuỗi ngày & Điểm danh
                            </h2>
                        </div>
                        <Link
                            href="/streak"
                            className="inline-flex items-center text-xs font-semibold text-[#1c7e47] transition-colors hover:underline"
                        >
                            Xem trang chuỗi
                            <ChevronRight className="size-3.5" />
                        </Link>
                    </div>

                    <div className="rounded-[26px] border border-[#e5eee7] bg-white p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-5">
                        {/* Streak Header Banner */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-orange-500/25">
                                    <Flame className="size-6 fill-white text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#142838]">
                                        {stats.streak > 0 ? `${stats.streak} ngày liên tiếp` : 'Bắt đầu chuỗi mới'}
                                    </p>
                                    <p className="text-[11px] text-[#607669]">
                                        {stats.streak > 0
                                            ? 'Tuyệt vời! Ngọn lửa vẫn đang cháy rực'
                                            : 'Điểm danh hôm nay để duy trì nhịp sống'}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/streak"
                                className="rounded-xl bg-[#ebf6ee] px-3 py-1.5 text-xs font-semibold text-[#1c7e47] transition-colors hover:bg-[#dff0e4]"
                            >
                                Vào trang chuỗi
                            </Link>
                        </div>

                        {/* Habits Quick Check-in List */}
                        {activeHabits.length > 0 ? (
                            <div className="mt-3.5 space-y-2">
                                <p className="text-[11px] font-medium text-slate-400">Thói quen hôm nay</p>
                                {activeHabits.slice(0, 3).map((habit) => (
                                    <div
                                        key={habit.id}
                                        className="flex items-center justify-between rounded-2xl bg-[#f8faf8] p-3 border border-slate-100/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                                className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold"
                                                style={{ backgroundColor: habit.color || '#10b981' }}
                                            >
                                                {habit.name.slice(0, 1).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-[#1c3024]">{habit.name}</p>
                                                <p className="text-[10px] text-slate-400">Chuỗi: {habit.current_streak} ngày</p>
                                            </div>
                                        </div>

                                        {habit.checked_in_today ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                                                <Check className="size-3 stroke-[3]" />
                                                Đã xong
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleCheckIn(habit.id)}
                                                disabled={checkingInId === habit.id}
                                                className="inline-flex items-center gap-1 rounded-full bg-[#1c7e47] px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs transition-transform active:scale-95 hover:bg-[#16693a] disabled:opacity-50"
                                            >
                                                <Flame className="size-3 fill-white text-white" />
                                                {checkingInId === habit.id ? 'Đang lưu...' : 'Điểm danh'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#f8faf8] p-3 text-xs text-slate-500">
                                <span>Chưa có thói quen nào. Tạo thói quen ngay!</span>
                                <Link href="/streak" className="font-semibold text-emerald-700 hover:underline">
                                    Tạo ngay
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* 6. NEW SECTION: Cùng nhau gắn kết (Together & Duo space shortcut) */}
                <section className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                            <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <UsersRound className="size-3.5 text-emerald-700" />
                            </span>
                            <h2 className="text-base font-bold tracking-tight text-[#142838] sm:text-lg">
                                Cùng nhau gắn kết
                            </h2>
                        </div>
                        <Link
                            href="/together"
                            className="inline-flex items-center text-xs font-semibold text-[#1c7e47] transition-colors hover:underline"
                        >
                            Vào phòng
                            <ChevronRight className="size-3.5" />
                        </Link>
                    </div>

                    <Link
                        href="/together"
                        className="group block rounded-[26px] border border-[#e5eee7] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all hover:border-emerald-300 hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-[#142838] group-hover:text-emerald-700 transition-colors">
                                    Không gian kết nối đôi & bạn bè
                                </p>
                                <p className="text-xs text-[#5d7366]">
                                    {togetherSummary.duoCount > 0
                                        ? `Đang có ${togetherSummary.duoCount} chuỗi đôi và ${togetherSummary.friendsCount} người bạn đồng hành.`
                                        : `Cùng ${togetherSummary.friendsCount > 0 ? togetherSummary.friendsCount : 'bạn bè'} duy trì thói quen và chia sẻ khoảnh khắc.`}
                                </p>
                            </div>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#ebf6ee] text-[#1c7e47] group-hover:scale-105 transition-transform">
                                <ChevronRight className="size-4" />
                            </div>
                        </div>
                    </Link>
                </section>

                {/* 7. Minimalist Quote Card */}
                <section className="rounded-2xl border border-[#e1ece4] bg-[#edf6f0] px-4 py-4 shadow-xs sm:px-6 sm:py-5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-serif text-3xl font-black leading-none text-[#6ea382] select-none sm:text-4xl">
                            “
                        </span>
                        <p className="flex-1 text-center font-sans text-sm font-semibold italic leading-relaxed text-[#2c4739] sm:text-base">
                            Mỗi khoảnh khắc nhỏ<br />
                            đều có ý nghĩa. ✨
                        </p>
                        <span className="font-serif text-3xl font-black leading-none text-[#6ea382] select-none sm:text-4xl">
                            ”
                        </span>
                    </div>
                </section>
            </div>

            {/* Photo Preview Modal */}
            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                <DialogContent className="max-w-md rounded-3xl p-4 sm:p-6 overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-[#142838]">
                            {selectedPhoto?.title || 'Khoảnh khắc'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPhoto && (
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-2xl bg-slate-100 aspect-[4/3]">
                                <img
                                    src={selectedPhoto.originalSrc || selectedPhoto.src}
                                    alt={selectedPhoto.alt || ''}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                {selectedPhoto.memory_id ? (
                                    <Link
                                        href={`/memory?id=${selectedPhoto.memory_id}`}
                                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                                    >
                                        Xem chi tiết khoảnh khắc
                                    </Link>
                                ) : (
                                    <Link
                                        href="/memory"
                                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                                    >
                                        Xem thư viện ảnh
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

/**
 * NatureHeaderIllustration:
 * A crisp vector illustration matching the cozy watercolor pine trees and green rolling hill
 * from the user's mockup header.
 */
function NatureHeaderIllustration() {
    return (
        <svg
            viewBox="0 0 170 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-auto w-full"
            aria-hidden="true"
        >
            <defs>
                {/* Back gentle hill gradient */}
                <linearGradient id="hill-back" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dcefdc" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#b4d7b3" stopOpacity="0.9" />
                </linearGradient>

                {/* Fore hill gradient */}
                <linearGradient id="hill-fore" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#bcdbb8" />
                    <stop offset="100%" stopColor="#8cb989" />
                </linearGradient>

                {/* Soft warm light bloom */}
                <radialGradient id="sun-glow" cx="60%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Warm soft sky glow */}
            <circle cx="110" cy="40" r="50" fill="url(#sun-glow)" />

            {/* Back rolling hill */}
            <path
                d="M15 105 C 50 78, 100 70, 170 82 L 170 120 L 15 120 Z"
                fill="url(#hill-back)"
            />

            {/* Fore rolling hill */}
            <path
                d="M45 110 C 85 92, 125 88, 170 96 L 170 120 L 45 120 Z"
                fill="url(#hill-fore)"
            />

            {/* Left Pine Tree (Tall, styled with 3 tiers of needles) */}
            <g id="tall-pine">
                {/* Tree Trunk */}
                <rect x="74" y="65" width="4.5" height="28" rx="2" fill="#755642" />

                {/* Bottom needles */}
                <path d="M60 70 L 76.5 48 L 93 70 Z" fill="#3f664c" />
                {/* Middle needles */}
                <path d="M63 53 L 76.5 35 L 90 53 Z" fill="#4d775a" />
                {/* Top needles */}
                <path d="M66 38 L 76.5 22 L 87 38 Z" fill="#598767" />
            </g>

            {/* Right Pine Tree / Leafy Tree */}
            <g id="bush-tree">
                {/* Tree Trunk */}
                <rect x="134" y="70" width="5" height="25" rx="2" fill="#694c39" />

                {/* Layered canopy */}
                <circle cx="136.5" cy="52" r="18" fill="#588566" />
                <circle cx="125" cy="57" r="13" fill="#4a7357" />
                <circle cx="146" cy="59" r="13" fill="#659474" />
                <circle cx="136" cy="42" r="12" fill="#72a381" />
            </g>

            {/* Smooth stone at the base */}
            <ellipse cx="114" cy="98" rx="15" ry="7" fill="#7c8983" />
            <ellipse cx="111" cy="96" rx="10" ry="4.5" fill="#93a09a" />
        </svg>
    );
}
