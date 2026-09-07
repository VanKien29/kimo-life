import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';
import * as React from 'react';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-brand-border bg-brand-surface px-6 py-12 text-center shadow-soft',
                className,
            )}
            {...props}
        >
            {/* Background illustration: full bleed, covers 100% of the box without white borders */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <img
                    src="/images/empty-state-art.jpg"
                    alt=""
                    className="h-full w-full object-cover object-center opacity-30 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-surface/90 via-brand-surface/75 to-brand-surface/90" />
            </div>

            {/* Content */}
            <span className="relative z-10 mb-4 flex size-12 items-center justify-center rounded-2xl border border-brand-border bg-white/80 text-brand-primary-dark shadow-soft backdrop-blur">
                <Leaf className="size-5" />
            </span>
            <h3 className="relative z-10 text-base font-semibold text-brand-text sm:text-lg">{title}</h3>
            {description && (
                <p className="relative z-10 mt-1 max-w-sm text-sm leading-6 text-brand-secondary">
                    {description}
                </p>
            )}
            {action && <div className="relative z-10 mt-5">{action}</div>}
        </div>
    );
}
