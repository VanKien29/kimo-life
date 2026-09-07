import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import * as React from 'react';

interface ActivityChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
}

export function ActivityChip({ active = false, className, children, ...props }: ActivityChipProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-[background-color,border-color,color,transform] active:scale-[0.98]',
                active
                    ? 'border-brand-primary bg-brand-pale text-brand-primary-dark'
                    : 'border-brand-border bg-brand-surface text-brand-secondary hover:border-brand-primary/60 hover:bg-brand-pale/60 hover:text-brand-primary-dark',
                className,
            )}
            {...props}
        >
            <Sparkles className="size-4" aria-hidden="true" />
            {children}
        </button>
    );
}
