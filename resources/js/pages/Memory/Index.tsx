import { MemoryComposer } from '@/components/memory/memory-composer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { takeQueuedMemoryPhotos } from '@/lib/memory-quick-capture';
import { type MemoryItem, type MemoryOption, type MemoryPaginator } from '@/types/memory';
import { Head, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Camera, Images, LayoutGrid, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface MemoryPageProps {
    memories: MemoryPaginator;
    activities: MemoryOption[];
    tags: string[];
    composer: {
        open: boolean;
        advanced?: boolean;
        memory: MemoryItem | null;
    };
    status?: string;
}

type AlbumPhoto = {
    id: string | number;
    src: string;
    alt: string;
    memoryId: number;
    caption: string;
};

export default function Memory({ memories, activities, tags, composer, status }: MemoryPageProps) {
    const page = usePage();
    const [composerOpen, setComposerOpen] = useState(composer.open);
    const [quickPhotos, setQuickPhotos] = useState<File[]>(() => takeQueuedMemoryPhotos());
    const [columns, setColumns] = useState<2 | 3 | 4>(3);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const touchStartY = useRef<number | null>(null);
    const wheelLocked = useRef(false);
    const albumPhotoCount = memories.data.reduce((count, memory) => count + memory.photos.length, 0);

    useEffect(() => {
        const queuedPhotos = takeQueuedMemoryPhotos();

        if (queuedPhotos.length > 0) setQuickPhotos(queuedPhotos);
    }, [composer.open, page.url]);

    useEffect(() => {
        if (viewerIndex === null) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setViewerOpen(false);
            if (event.key === 'ArrowUp') setViewerIndex((current) => (current === null ? current : Math.max(0, current - 1)));
            if (event.key === 'ArrowDown') setViewerIndex((current) => (current === null ? current : Math.min(albumPhotoCount - 1, current + 1)));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [albumPhotoCount, viewerIndex]);

    const albumPhotos = useMemo<AlbumPhoto[]>(
        () =>
            memories.data.flatMap((memory) =>
                memory.photos.map((photo, index) => ({
                    id: photo.id ?? memory.id + '-' + index,
                    src: photo.src,
                    alt: photo.alt,
                    memoryId: memory.id,
                    caption: memory.content || memory.title || 'Một khoảnh khắc nhỏ',
                })),
            ),
        [memories.data],
    );

    const currentPhoto = viewerIndex === null ? null : albumPhotos[viewerIndex] ?? null;

    function moveViewer(offset: -1 | 1) {
        setViewerIndex((current) => {
            if (current === null) return current;

            const next = current + offset;
            return next >= 0 && next < albumPhotos.length ? next : current;
        });
    }

    const openViewer = (index: number) => {
        setViewerIndex(index);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
    };

    const finishViewerClose = () => {
        if (!viewerOpen) setViewerIndex(null);
    };

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartY.current === null) return;

        const distance = (event.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
        touchStartY.current = null;

        if (Math.abs(distance) < 48) return;
        moveViewer(distance > 0 ? -1 : 1);
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (wheelLocked.current || Math.abs(event.deltaY) < 24) return;

        wheelLocked.current = true;
        moveViewer(event.deltaY > 0 ? 1 : -1);
        window.setTimeout(() => {
            wheelLocked.current = false;
        }, 450);
    };

    const handleComposerOpenChange = (open: boolean) => {
        setComposerOpen(open);

        if (!open) setQuickPhotos([]);
    };

    const gridClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];

    return (
        <AppLayout>
            <Head title="Album khoảnh khắc" />

            <div className="mx-auto w-full max-w-4xl space-y-5 py-2 sm:space-y-6 sm:py-4">
                {status && <Toast title={status} />}

                <header className="flex items-end justify-between gap-4 px-1">
                    <div>
                        <p className="text-brand-primary-dark text-sm font-medium">Khoảnh khắc của bạn</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Album ảnh</h1>
                        <p className="text-brand-secondary mt-1 text-sm">Mỗi bức ảnh giữ lại một điều nhỏ.</p>
                    </div>
                    <Button type="button" size="icon" aria-label="Mở camera" onClick={() => setComposerOpen(true)}>
                        <Plus />
                    </Button>
                </header>

                <div className="flex items-center justify-between gap-3 px-1">
                    <div className="text-brand-secondary flex items-center gap-1.5 text-xs">
                        <Images className="size-4" />
                        {albumPhotos.length} ảnh
                    </div>
                    <div className="border-brand-border bg-brand-surface flex items-center gap-1 rounded-lg border p-1" aria-label="Số ảnh mỗi hàng">
                        <LayoutGrid className="text-brand-muted ml-1 size-3.5" />
                        {[2, 3, 4].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-label={value + ' ảnh mỗi hàng'}
                                aria-pressed={columns === value}
                                onClick={() => setColumns(value as 2 | 3 | 4)}
                                className={'flex size-7 items-center justify-center rounded-md text-xs font-semibold transition-colors ' + (columns === value ? 'bg-brand-primary text-white' : 'text-brand-secondary hover:bg-brand-pale')}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                {albumPhotos.length === 0 ? (
                    <EmptyState
                        title="Album chưa có ảnh"
                        description="Bấm nút + để mở camera và lưu khoảnh khắc đầu tiên."
                        action={
                            <Button type="button" onClick={() => setComposerOpen(true)}>
                                <Camera />
                                Mở camera
                            </Button>
                        }
                    />
                ) : (
                    <section className={'grid ' + gridClass + ' gap-2 sm:gap-3'} aria-label="Album ảnh">
                        {albumPhotos.map((photo, index) => (
                            <motion.button
                                key={photo.id}
                                layoutId={'memory-photo-' + photo.id}
                                type="button"
                                onClick={() => openViewer(index)}
                                aria-label="Xem khoảnh khắc"
                                className="group relative aspect-square overflow-hidden rounded-xl bg-brand-pale text-left shadow-soft"
                            >
                                <img src={photo.src} alt={photo.alt} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
                            </motion.button>
                        ))}
                    </section>
                )}
            </div>

            <AnimatePresence>
                {currentPhoto && viewerIndex !== null && (
                    <motion.div
                        key="memory-viewer"
                        initial={false}
                        animate={{ opacity: viewerOpen ? 1 : 0 }}
                        onAnimationComplete={finishViewerClose}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Xem khoảnh khắc"
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 sm:p-8"
                        onClick={closeViewer}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onWheel={handleWheel}
                    >
                        <button type="button" aria-label="Quay lại album" onClick={closeViewer} className="absolute top-4 left-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25">
                            <ArrowLeft className="size-5" />
                        </button>
                        <span className="absolute top-5 left-1/2 z-10 -translate-x-1/2 text-xs font-medium text-white/75">
                            {viewerIndex + 1} / {albumPhotos.length}
                        </span>

                        <AnimatePresence mode="wait" initial={false}>
                            {viewerOpen && (
                                <motion.div
                                    key={currentPhoto.id}
                                    layoutId={'memory-photo-' + currentPhoto.id}
                                    initial={false}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: -24 }}
                                    transition={{ type: 'spring', stiffness: 460, damping: thirtyFive, mass: 0.65 }}
                                    onClick={(event) => event.stopPropagation()}
                                    className="relative z-10 max-h-[calc(100svh-6rem)] w-full max-w-xl overflow-hidden rounded-xl bg-black shadow-2xl"
                                >
                                    <img src={currentPhoto.src} alt={currentPhoto.alt} className="max-h-[calc(100svh-6rem)] w-full object-contain" />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-5 pb-6 pt-16">
                                        <p className="truncate text-center text-sm font-medium text-white drop-shadow sm:text-base">{currentPhoto.caption}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <p className="absolute right-0 bottom-5 left-0 text-center text-xs font-medium text-white/60">Vuốt lên để xem ảnh cũ · Vuốt xuống để xem ảnh mới</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <MemoryComposer
                key={composer.memory?.id ?? 'new'}
                open={composerOpen}
                onOpenChange={handleComposerOpenChange}
                activities={activities}
                tags={tags}
                memory={composer.memory}
                initialPhotos={quickPhotos}
                advanced={composer.advanced}
            />
        </AppLayout>
    );
}

const thirtyFive = 35;
