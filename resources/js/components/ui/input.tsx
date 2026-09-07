import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'flex h-11 w-full rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-base text-brand-text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-brand-text placeholder:text-brand-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
