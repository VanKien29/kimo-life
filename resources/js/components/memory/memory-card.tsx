import { PhotoCarousel } from '@/components/shared/photo-carousel';
import { PhotoStack } from '@/components/shared/photo-stack';
import { SinglePhoto } from '@/components/shared/single-photo';
import { Tag } from '@/components/ui/tag';
import { type MemoryItem } from '@/types/memory';
import { Link, router } from '@inertiajs/react';
import { Heart, MapPin, PenLine } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

interface MemoryCardProps {
    memory: MemoryItem;
}

export function MemoryCard({ memory }: MemoryCardProps) {
    const reduceMotion = useReducedMotion();
    const [favorite, setFavorite] = useState(memory.is_favorite);
    const title = memory.title || memory.content?.split('\n')[0] || 'Một khoảnh khắc nhỏ';
    const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(`${memory.memory_date}T12:00:00`),
    );

    const toggleFavorite = () => {
        router.post(
            route('memory.favorite', memory.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setFavorite((value) => !value),
            },
        );
    };

    return (
        <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-brand-border bg-brand-surface shadow-soft overflow-hidden rounded-3xl border"
        >
            <Link href={route('memory.show', memory.id)} className="block focus-visible:relative">
                {memory.photos.length === 3 ? (
                    <PhotoStack
                        photos={memory.photos as [(typeof memory.photos)[0], (typeof memory.photos)[1], (typeof memory.photos)[2]]}
                        className="bg-brand-pale max-w-none rounded-none px-5 py-4"
                    />
                ) : memory.photos.length > 1 ? (
                    <PhotoCarousel photos={memory.photos} className="bg-brand-pale p-3" />
                ) : memory.photos.length === 1 ? (
                    <SinglePhoto photo={memory.photos[0]} className="aspect-[16/10] rounded-none" />
                ) : (
                    <div className="bg-brand-pale text-brand-primary-dark flex aspect-[16/7] items-center justify-center">
                        <PenLine className="size-7" />
                    </div>
                )}

                <div className="space-y-2 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-brand-secondary text-xs font-medium">{dateLabel}</p>
                            <h2 className="mt-1 line-clamp-2 text-base font-bold tracking-tight sm:text-lg">{title}</h2>
                        </div>
                        <span className="bg-brand-pale text-brand-primary-dark shrink-0 rounded-full px-2.5 py-1 text-xs">
                            {memory.visibility === 'private' ? 'Riêng tư' : memory.visibility === 'friends' ? 'Bạn bè' : 'Công khai'}
                        </span>
                    </div>
                    {memory.content && memory.title && <p className="text-brand-secondary line-clamp-3 text-sm leading-6">{memory.content}</p>}
                    {(memory.location || memory.activities.length > 0 || memory.tags.length > 0) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {memory.location && (
                                <Tag tone="neutral">
                                    <MapPin className="mr-1 size-3.5" />
                                    {memory.location}
                                </Tag>
                            )}
                            {memory.activities.slice(0, 2).map((activity) => (
                                <Tag key={activity.id}>{activity.name}</Tag>
                            ))}
                            {memory.tags.slice(0, 2).map((tag) => (
                                <Tag key={tag}>#{tag}</Tag>
                            ))}
                        </div>
                    )}
                </div>
            </Link>

            <div className="border-brand-border/70 flex items-center justify-between border-t px-4 py-2.5 sm:px-5">
                <span className="text-brand-muted text-xs">Nhấn để xem chi tiết</span>
                <button
                    type="button"
                    aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                    aria-pressed={favorite}
                    onClick={toggleFavorite}
                    className="text-brand-secondary hover:bg-brand-pale hover:text-brand-primary-dark inline-flex size-10 items-center justify-center rounded-full transition-[background-color,color,transform] active:scale-[0.96]"
                >
                    <Heart className={favorite ? 'fill-brand-streak text-brand-streak size-5' : 'size-5'} />
                </button>
            </div>
        </motion.article>
    );
}
