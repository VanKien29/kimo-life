import { Tag } from '@/components/ui/tag';
import { type MemoryItem } from '@/types/memory';
import { Link, router } from '@inertiajs/react';
import { Heart, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

export function SearchResultCard({ memory }: { memory: MemoryItem }) {
    const [favorite, setFavorite] = useState(memory.is_favorite);
    const title = memory.title || memory.content?.split('\n')[0] || 'Một khoảnh khắc nhỏ';
    const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(`${memory.memory_date}T12:00:00`),
    );

    const toggleFavorite = () => {
        router.post(route('memory.favorite', memory.id), {}, { preserveScroll: true, onSuccess: () => setFavorite((value) => !value) });
    };

    return (
        <article className="border-brand-border bg-brand-surface shadow-soft overflow-hidden rounded-3xl border">
            <div className="flex min-h-36">
                <Link href={route('memory.show', memory.id)} className="bg-brand-pale relative block w-32 shrink-0 sm:w-44">
                    {memory.photos[0] ? (
                        <img src={memory.photos[0].src} alt={memory.photos[0].alt} className="size-full object-cover" />
                    ) : (
                        <span className="text-brand-primary-dark flex size-full items-center justify-center">
                            <Search className="size-7" />
                        </span>
                    )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                        <Link href={route('memory.show', memory.id)} className="min-w-0">
                            <p className="text-brand-secondary text-xs font-medium">{dateLabel}</p>
                            <h2 className="mt-1 line-clamp-2 text-base font-bold tracking-tight">{title}</h2>
                        </Link>
                        <button
                            type="button"
                            aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                            aria-pressed={favorite}
                            onClick={toggleFavorite}
                            className="text-brand-secondary hover:bg-brand-pale inline-flex size-9 shrink-0 items-center justify-center rounded-full"
                        >
                            <Heart className={favorite ? 'fill-brand-streak text-brand-streak size-4' : 'size-4'} />
                        </button>
                    </div>
                    {memory.content && <p className="text-brand-secondary mt-2 line-clamp-2 text-sm leading-5">{memory.content}</p>}
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                        {memory.location && (
                            <Tag tone="neutral">
                                <MapPin className="mr-1 size-3" />
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
                </div>
            </div>
        </article>
    );
}
