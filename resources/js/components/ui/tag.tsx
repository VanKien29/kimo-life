import { cn } from '@/lib/utils';
import * as React from 'react';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: 'green' | 'neutral' | 'orange' | 'blue';
}

const tagTones = {
    green: 'bg-brand-pale text-brand-primary-dark',
    neutral: 'bg-brand-background text-brand-secondary',
    orange: 'bg-brand-accent/45 text-orange-900',
    blue: 'bg-brand-blue/25 text-blue-900',
};

export function Tag({ className, tone = 'green', ...props }: TagProps) {
    return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', tagTones[tone], className)} {...props} />;
}
