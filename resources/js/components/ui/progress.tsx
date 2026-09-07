import { cn } from '@/lib/utils';
import * as React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
    const normalizedValue = Math.min(100, Math.max(0, value));

    return (
        <div className={cn('h-2 w-full overflow-hidden rounded-full bg-brand-pale', className)} {...props}>
            <div className="h-full rounded-full bg-brand-primary transition-[width] duration-300" style={{ width: `${normalizedValue}%` }} />
        </div>
    );
}
