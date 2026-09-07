import { cn } from '@/lib/utils';
import * as React from 'react';

interface DropdownProps extends React.ComponentProps<'details'> {
    label: React.ReactNode;
}

export function Dropdown({ label, className, children, ...props }: DropdownProps) {
    return (
        <details className={cn('relative', className)} {...props}>
            <summary className="list-none [&::-webkit-details-marker]:hidden">{label}</summary>
            <div className="absolute right-0 z-30 mt-2 min-w-48 rounded-2xl border border-brand-border bg-brand-surface p-1.5 shadow-soft">{children}</div>
        </details>
    );
}

export function DropdownItem({ className, ...props }: React.ComponentProps<'button'>) {
    return <button type="button" className={cn('flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-pale', className)} {...props} />;
}
