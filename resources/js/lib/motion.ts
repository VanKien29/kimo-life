import type { Variants } from 'motion/react';

export const motionDurations = {
    fast: 0.16,
    normal: 0.24,
    emphasized: 0.36,
} as const;

export const pageMotion: Variants = {
    initial: { opacity: 0, x: 12, y: 8 },
    animate: { opacity: 1, x: 0, y: 0, transition: { duration: motionDurations.normal, ease: 'easeOut' } },
    exit: { opacity: 0, x: -12, y: -4, transition: { duration: motionDurations.fast, ease: 'easeIn' } },
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
