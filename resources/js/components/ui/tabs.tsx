import { cn } from '@/lib/utils';
import * as React from 'react';

export interface TabItem {
    id: string;
    label: string;
}

interface TabsProps {
    items: TabItem[];
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
}

export function Tabs({ items, value, onValueChange, className }: TabsProps) {
    return (
        <div role="tablist" className={cn('inline-flex items-center gap-1 rounded-xl bg-brand-pale p-1', className)}>
            {items.map((item) => {
                const selected = item.id === value;

                return (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onValueChange(item.id)}
                        className={cn(
                            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            selected ? 'bg-brand-surface text-brand-primary-dark shadow-soft' : 'text-brand-secondary hover:text-brand-primary-dark',
                        )}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
