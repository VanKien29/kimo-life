import { PhotoCarousel } from '@/components/shared/photo-carousel';
import { PhotoStack } from '@/components/shared/photo-stack';
import { SinglePhoto } from '@/components/shared/single-photo';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Card } from '@/components/ui/card';
import { type SharedMemoryItem } from '@/types/shared-memory';
import { Link } from '@inertiajs/react';
import { CalendarDays, Image, NotebookPen } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface SharedMemoryCardProps {
    sharedMemory: SharedMemoryItem;
}

export function SharedMemoryCard({ sharedMemory }: SharedMemoryCardProps) {
    const reduceMotion = useReducedMotion();
    const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(`${sharedMemory.memory_date}T12:00:00`),
    );
    const avatarItems = sharedMemory.participants.map((participant) => ({
        id: participant.user.id,
        name: participant.user.name,
        src: participant.user.avatar ?? undefined,
    }));

    return (
        <motion.article initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <Link href={route('shared-memories.show', sharedMemory.id)} className="block h-full rounded-3xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary-dark">
                <Card className="h-full overflow-hidden border-0 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-float">
                    {sharedMemory.photos.length === 3 ? (
                        <PhotoStack
                            photos={sharedMemory.photos as [(typeof sharedMemory.photos)[0], (typeof sharedMemory.photos)[1], (typeof sharedMemory.photos)[2]]}
                            className="bg-brand-pale max-w-none rounded-none px-5 py-4"
                        />
                    ) : sharedMemory.photos.length > 1 ? (
                        <PhotoCarousel photos={sharedMemory.photos} className="bg-brand-pale p-3" />
                    ) : sharedMemory.photos.length === 1 ? (
                        <SinglePhoto photo={sharedMemory.photos[0]} className="aspect-[16/10] rounded-none" />
                    ) : (
                        <div className="bg-brand-pale text-brand-primary-dark flex aspect-[16/7] items-center justify-center">
                            <Image className="size-7" />
                        </div>
                    )}

                    <div className="space-y-3 p-4 sm:p-5">
                        <div>
                            <p className="text-brand-secondary flex items-center gap-1.5 text-xs font-medium">
                                <CalendarDays className="size-3.5" />
                                {dateLabel}
                            </p>
                            <h2 className="mt-1 text-lg font-bold tracking-tight">{sharedMemory.title}</h2>
                            {sharedMemory.description && <p className="text-brand-secondary mt-1 line-clamp-2 text-sm leading-6">{sharedMemory.description}</p>}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <AvatarGroup items={avatarItems} />
                            <div className="text-brand-secondary flex items-center gap-3 text-xs">
                                <span className="inline-flex items-center gap-1">
                                    <Image className="size-3.5" /> {sharedMemory.photo_count}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <NotebookPen className="size-3.5" /> {sharedMemory.notes_count}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.article>
    );
}
