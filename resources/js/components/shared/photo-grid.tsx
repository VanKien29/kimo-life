import { SinglePhoto, type PhotoItem } from '@/components/shared/single-photo';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
    photos: PhotoItem[];
    className?: string;
}

export function PhotoGrid({ photos, className }: PhotoGridProps) {
    return (
        <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3', className)}>
            {photos.map((photo) => (
                <SinglePhoto key={photo.id ?? photo.src} photo={photo} className="aspect-square rounded-xl" />
            ))}
        </div>
    );
}
