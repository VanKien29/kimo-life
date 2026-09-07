import { router } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

export function MobilePageLoader() {
    const [loading, setLoading] = useState(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const removeStartListener = router.on('start', () => setLoading(true));
        const removeFinishListener = router.on('finish', () => setLoading(false));

        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <div
                    role="status"
                    aria-label="Đang tải trang"
                    className="bg-brand-pale pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden md:hidden"
                >
                    <motion.div
                        className="bg-brand-primary h-full w-2/5 rounded-full"
                        initial={reduceMotion ? { width: '35%' } : { x: '-100%' }}
                        animate={reduceMotion ? { width: '100%' } : { x: ['-100%', '250%'] }}
                        exit={{ opacity: 0 }}
                        transition={reduceMotion ? { duration: 0.2 } : { duration: 0.9, ease: 'linear', repeat: Infinity }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
