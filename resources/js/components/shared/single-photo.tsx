import { cn } from '@/lib/utils';
import * as React from 'react';

export interface PhotoItem {
    id?: string | number;
    src: string;
    alt: string;
}

interface SinglePhotoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    photo: PhotoItem;
}

export function SinglePhoto({ photo, className, ...props }: SinglePhotoProps) {
    return <img src={photo.src} alt={photo.alt} loading="lazy" className={cn('aspect-[4/3] w-full rounded-2xl object-cover', className)} {...props} />;
}
