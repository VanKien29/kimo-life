import { cn } from '@/lib/utils';
import * as React from 'react';

export type LogoVariant = 'full' | 'mark' | 'wordmark' | 'monochrome';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: LogoVariant;
    compact?: boolean;
    tagline?: boolean;
}

/**
 * Centralized Kimo Life logo placeholder.
 * Replace the mark paths here when final brand artwork is approved; pages should
 * continue using this component rather than drawing their own logo.
 */
export function Logo({ variant = 'full', compact = false, tagline = false, className, ...props }: LogoProps) {
    const showMark = variant === 'full' || variant === 'mark' || variant === 'monochrome';
    const showWordmark = variant === 'full' || variant === 'wordmark' || variant === 'monochrome';
    const monochrome = variant === 'monochrome';

    return (
        <div className={cn('inline-flex items-center gap-2', className)} {...props}>
            {showMark && (
                <span
                    aria-hidden="true"
                    className={cn(
                        'flex shrink-0 items-center justify-center',
                        monochrome ? 'text-current' : 'text-brand-primary-dark',
                        compact ? 'size-8 rounded-xl bg-brand-primary text-white shadow-soft' : 'size-11',
                    )}
                >
                    <svg viewBox="0 0 40 40" className="size-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 7v26c0 2 1.4 3 3.2 3h1.4c1.8 0 3.1-1 3.1-3V23l11.7 11.2c1.2 1.1 3.1 1.1 4.2-.1l.7-.8c1.1-1.2 1-3.1-.2-4.2L22.5 19.4 33.2 8.8c1.1-1.1 1.1-3-.1-4.1l-.7-.6c-1.2-1.1-3-1.1-4.1 0L17.7 14.6V7c0-2-1.4-3-3.2-3h-1.3C11.4 4 10 5 10 7Z" fill="currentColor" />
                        <path d="M31 5c8-2 12 1 13 7-7 2-11 0-13-7Z" fill="#7fbd88" transform="translate(-3 0)" />
                        <path d="M32 13c7-1 10 2 11 7-6 1-9-1-11-7ZM33 23c5 0 8 3 8 7-5 0-8-2-8-7Z" fill="#63a976" transform="translate(-3 0)" />
                    </svg>
                </span>
            )}
            {showWordmark && (
                <span className={cn('whitespace-nowrap text-xl font-extrabold tracking-[-0.045em] text-brand-text', monochrome && 'text-current')}>
                    Kimo <span className={cn('text-brand-primary-dark', monochrome && 'text-current')}>Life</span>
                    {tagline && <span className="text-brand-secondary mt-0.5 block text-[10px] font-medium tracking-[0.08em]">SMALL MOMENTS. A BETTER YOU.</span>}
                </span>
            )}
        </div>
    );
}

export default Logo;
