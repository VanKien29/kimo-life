import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { type MemoryItem } from '@/types/memory';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface MemoryShowProps {
    memory: MemoryItem;
    feed?: MemoryItem[];
    status?: string;
}

function dateLabel(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value + 'T12:00:00'));
}

function MemoryCard({ item, onSend, sending }: { item: MemoryItem; onSend: (item: MemoryItem) => void; sending: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const canSendMessage = Boolean(item.owner && item.owner.id !== auth.user.id);
    const caption = item.content || item.title || 'Một khoảnh khắc nhỏ';

    return (
        <article className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <time className="text-brand-muted text-xs" dateTime={item.memory_date}>
                    {dateLabel(item.memory_date)}
                </time>
                <span className="bg-brand-pale text-brand-primary-dark rounded-full px-2.5 py-1 text-[11px] font-semibold">Đang xem</span>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-black shadow-float">
                {item.photos[0] ? (
                    <img src={item.photos[0].src} alt={item.photos[0].alt} className="size-full object-cover" />
                ) : (
                    <div className="bg-brand-pale text-brand-primary-dark flex size-full items-center justify-center text-sm">Chưa có ảnh</div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-5 pb-6 pt-16">
                    <p className="truncate text-center text-sm font-medium text-white drop-shadow sm:text-base">{caption}</p>
                </div>
            </div>

            {canSendMessage && (
                <motion.button
                    type="button"
                    onClick={() => onSend(item)}
                    disabled={sending}
                    whileTap={{ scale: 0.96 }}
                    className="bg-brand-primary text-white shadow-float mx-auto flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors hover:bg-brand-primary-dark disabled:cursor-wait disabled:opacity-80"
                >
                    {sending ? (
                        <motion.span animate={{ x: [0, 18, 38], y: [0, -8, -22], opacity: [1, 1, 0] }} transition={{ duration: 0.5 }}>
                            <Send className="size-4" />
                        </motion.span>
                    ) : (
                        <Send className="size-4" />
                    )}
                    {sending ? 'Đang gửi vào tin nhắn…' : 'Gửi cho ' + (item.owner?.name ?? 'chủ khoảnh khắc')}
                </motion.button>
            )}
        </article>
    );
}

export default function MemoryShow({ memory, feed, status }: MemoryShowProps) {
    const { auth } = usePage<SharedData>().props;
    const items = useMemo(() => (feed && feed.length > 0 ? feed : [memory]), [feed, memory]);
    const initialIndex = Math.max(
        0,
        items.findIndex((item) => item.id === memory.id),
    );
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const wheelLocked = useRef(false);
    const currentItem = items[currentIndex] ?? memory;

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, memory.id]);

    const moveViewer = (offset: -1 | 1) => {
        setCurrentIndex((current) => Math.max(0, Math.min(items.length - 1, current + offset)));
    };

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartY.current === null) return;

        const distance = (event.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
        touchStartY.current = null;

        if (Math.abs(distance) >= 48) moveViewer(distance > 0 ? -1 : 1);
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (wheelLocked.current || Math.abs(event.deltaY) < 24) return;

        wheelLocked.current = true;
        moveViewer(event.deltaY > 0 ? 1 : -1);
        window.setTimeout(() => {
            wheelLocked.current = false;
        }, 450);
    };

    const sendMessage = (item: MemoryItem) => {
        if (!item.owner || item.owner.id === auth.user.id || sendingId !== null) return;

        router.post(
            route('memory.message', item.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setSendingId(item.id),
                onError: () => setSendingId(null),
            },
        );
    };

    return (
        <AppLayout>
            <Head title={memory.title || 'Chi tiết khoảnh khắc'} />

            <div className="mx-auto w-full max-w-xl py-2 sm:py-4">
                <div className="mb-3 flex items-center justify-between px-1">
                    <Button asChild variant="ghost" className="text-brand-secondary">
                        <Link href={route('memory.index')}>
                            <ArrowLeft />
                            Album ảnh
                        </Link>
                    </Button>
                    <span className="text-brand-muted text-xs">
                        {currentIndex + 1} / {items.length}
                    </span>
                </div>

                <div className="min-h-[520px] overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onWheel={handleWheel}>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={currentItem.id}
                            initial={{ opacity: 0, y: 34, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -34, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                        >
                            <MemoryCard item={currentItem} onSend={sendMessage} sending={sendingId === currentItem.id} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <p className="text-brand-muted mt-3 text-center text-xs">Vuốt lên xem ảnh cũ · Vuốt xuống xem ảnh mới</p>
                {status && <p className="text-brand-primary-dark mt-2 text-center text-sm font-medium">{status}</p>}
            </div>
        </AppLayout>
    );
}
