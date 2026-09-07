import { SinglePhoto, type PhotoItem } from '@/components/shared/single-photo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface PhotoCarouselProps {
    photos: PhotoItem[];
    className?: string;
}

export function PhotoCarousel({ photos, className }: PhotoCarouselProps) {
    const [index, setIndex] = useState(0);

    if (photos.length === 0) return null;

    const current = photos[index];

    return (
        <div className={cn('relative', className)}>
            <SinglePhoto photo={current} className="aspect-[4/3]" />
            {photos.length > 1 && (
                <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Ảnh trước"
                        onClick={() => setIndex((value) => (value - 1 + photos.length) % photos.length)}
                        className="rounded-full bg-brand-surface/90"
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Ảnh tiếp theo"
                        onClick={() => setIndex((value) => (value + 1) % photos.length)}
                        className="rounded-full bg-brand-surface/90"
                    >
                        <ChevronRight />
                    </Button>
                </div>
            )}
        </div>
    );
}
