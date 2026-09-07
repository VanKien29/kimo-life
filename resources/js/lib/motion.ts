import type { Variants } from 'motion/react';

export const motionDurations = {
    fast: 0.16,
    normal: 0.24,
    emphasized: 0.36,
} as const;

export const pageMotion: Variants = {
    initial: { opacity: 0, x: 8, y: 3 },
    animate: { opacity: 1, x: 0, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -8, y: -2, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

export const cardMotion: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: motionDurations.fast, ease: 'easeOut' } },
};

export const modalMotion: Variants = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: { duration: motionDurations.normal, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: motionDurations.fast, ease: 'easeIn' } },
};

export const springMotion = { type: 'spring' as const, stiffness: 360, damping: 28, mass: 0.7 };
