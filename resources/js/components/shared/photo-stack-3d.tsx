import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';

interface PhotoStack3DProps {
    photos?: Array<{ src: string; alt: string }>;
    className?: string;
}

const defaultPhotos = [
    { src: '/images/photo-sunset.jpg', alt: 'Hoàng hôn trên hồ' },
    { src: '/images/character-onboarding.jpg', alt: 'Kimo Life - Better Days Ahead :)' },
    { src: '/images/photo-cafe.jpg', alt: 'Góc cafe ấm cúng' },
];

/**
 * 3D-perspective photo stack like in the mockup hero section.
 * Cards fan out from center with slight rotation and perspective.
 */
export function PhotoStack3D({ photos = defaultPhotos, className }: PhotoStack3DProps) {
    const reduceMotion = useReducedMotion();
    const displayPhotos = photos.slice(0, 3);

    // Position config for each card in the stack
    const cardStyles: Array<{
        rotate: number;
        translateX: number;
        translateY: number;
        zIndex: number;
        delay: number;
    }> = [
        { rotate: -8, translateX: -30, translateY: 20, zIndex: 1, delay: 0.1 },
        { rotate: 0, translateX: 0, translateY: 0, zIndex: 3, delay: 0 },
        { rotate: 8, translateX: 30, translateY: 20, zIndex: 2, delay: 0.2 },
    ];

    return (
        <div className={cn('kimo-photo-stack relative flex items-center justify-center py-8', className)}>
            {displayPhotos.map((photo, index) => {
                const style = cardStyles[index] ?? cardStyles[1];

                return (
                    <motion.div
                        key={photo.src}
                        className="kimo-photo-card absolute overflow-hidden rounded-2xl border-4 border-white shadow-float"
                        initial={reduceMotion ? false : { opacity: 0, y: 30, rotate: 0, scale: 0.85 }}
                        animate={{
                            opacity: 1,
                            y: style.translateY,
                            x: style.translateX,
                            rotate: style.rotate,
                            scale: 1,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 20,
                            delay: style.delay,
                        }}
                        style={{ zIndex: style.zIndex }}
                    >
                        <img
                            src={photo.src}
                            alt={photo.alt}
                            className="h-52 w-40 object-cover sm:h-64 sm:w-48"
                            loading="lazy"
                        />
                    </motion.div>
                );
            })}

            {/* Floating sticker */}
            <motion.div
                className="absolute -bottom-2 right-0 z-10 rounded-2xl border border-brand-border bg-white/90 px-3 py-2 shadow-soft backdrop-blur sm:right-4 sm:bottom-2"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', delay: 0.5 }}
            >
                <p className="text-xs font-medium text-brand-primary-dark italic sm:text-sm">
                    Những điều nhỏ
                </p>
                <p className="text-xs font-medium text-brand-primary-dark italic sm:text-sm">
                    làm nên ngày tuyệt vời
                </p>
            </motion.div>
        </div>
    );
}
