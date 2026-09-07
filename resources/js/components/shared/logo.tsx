import { cn } from '@/lib/utils';
import * as React from 'react';

export type LogoVariant = 'full' | 'mark' | 'wordmark' | 'monochrome';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: LogoVariant;
    compact?: boolean;
    tagline?: boolean;
}

const logoImage = '/images/kimo-logo.png';

/** Centralized Kimo Life logo used by the web header and authentication screens. */
export function Logo({ variant = 'full', compact = false, tagline = false, className, ...props }: LogoProps) {
    const showMark = variant === 'full' || variant === 'mark' || variant === 'monochrome';
    const showWordmark = variant === 'full' || variant === 'wordmark' || variant === 'monochrome';
    const monochrome = variant === 'monochrome';

    return (
        <div className={cn('inline-flex items-center gap-2', className)} {...props}>
            {showMark && (
                <img
                    src={logoImage}
                    alt={showWordmark ? '' : 'Kimo Life'}
                    className={cn(
                        'shrink-0 object-contain',
                        compact ? 'size-8 rounded-xl shadow-soft' : 'size-11',
                    )}
                />
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
