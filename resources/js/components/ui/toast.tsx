import { cn } from '@/lib/utils';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import * as React from 'react';

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    tone?: 'success' | 'info' | 'warning';
    title: string;
    description?: string;
}

const toastTone = {
    success: { icon: CheckCircle2, className: 'bg-brand-pale text-brand-primary-dark' },
    info: { icon: Info, className: 'bg-brand-blue/20 text-blue-900' },
    warning: { icon: TriangleAlert, className: 'bg-brand-accent/35 text-orange-950' },
};

export function Toast({ className, tone = 'success', title, description, ...props }: ToastProps) {
    const { icon: Icon, className: toneClassName } = toastTone[tone];

    return (
        <div role="status" aria-live="polite" className={cn('flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-soft', className)} {...props}>
            <span className={cn('mt-0.5 rounded-full p-1.5', toneClassName)}>
                <Icon className="size-4" />
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-semibold text-brand-text">{title}</span>
                {description && <span className="mt-0.5 block text-sm text-brand-secondary">{description}</span>}
            </span>
        </div>
    );
}
