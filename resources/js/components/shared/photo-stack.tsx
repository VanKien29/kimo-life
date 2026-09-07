import { type PhotoItem } from '@/components/shared/single-photo';
import { cn } from '@/lib/utils';
import { springMotion } from '@/lib/motion';
import { motion, useReducedMotion } from 'motion/react';

interface PhotoStackProps {
    photos: readonly [PhotoItem, PhotoItem, PhotoItem];
    className?: string;
    label?: string;
}

export function PhotoStack({ photos, className, label = 'Ba ảnh trong một khoảnh khắc' }: PhotoStackProps) {
    const reduceMotion = useReducedMotion();

    return (
        <div className={cn('relative isolate mx-auto aspect-[4/3] w-full max-w-sm', className)} role="img" aria-label={label}>
            {photos.map((photo, index) => {
                const isCenter = index === 1;
                const rotation = index === 0 ? -6 : index === 2 ? 6 : 0;
                const x = index === 0 ? -20 : index === 2 ? 20 : 0;

                return (
                    <motion.div
                        key={photo.id ?? `${photo.src}-${index}`}
                        className={cn(
                            'absolute inset-y-[5%] w-[72%] overflow-hidden rounded-2xl border-4 border-brand-surface bg-brand-pale shadow-soft',
                            isCenter ? 'inset-x-[14%] z-20' : index === 0 ? 'left-0 z-10' : 'right-0 z-10',
                        )}
                        initial={reduceMotion ? false : { opacity: 0, rotate: 0, x: 0, scale: isCenter ? 0.98 : 0.96 }}
                        animate={{ opacity: 1, rotate: reduceMotion ? 0 : rotation, x: reduceMotion ? 0 : x, scale: 1 }}
                        whileHover={reduceMotion || isCenter ? undefined : { x: index === 0 ? -28 : 28, rotate: rotation * 1.15 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                        transition={springMotion}
                    >
                        <img src={photo.src} alt={photo.alt} loading="lazy" className="size-full object-cover" />
                    </motion.div>
                );
            })}
        </div>
    );
}
