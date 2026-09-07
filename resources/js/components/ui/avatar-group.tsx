import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface AvatarGroupItem {
    id: string | number;
    name: string;
    src?: string;
}

interface AvatarGroupProps {
    items: AvatarGroupItem[];
    max?: number;
    className?: string;
}

export function AvatarGroup({ items, max = 4, className }: AvatarGroupProps) {
    const visibleItems = items.slice(0, max);
    const remaining = items.length - visibleItems.length;

    return (
        <div className={cn('flex items-center', className)} aria-label={`${items.length} người tham gia`}>
            {visibleItems.map((item, index) => (
                <Avatar key={item.id} className={cn('size-8 border-2 border-brand-surface shadow-none', index > 0 && '-ml-2')}>
                    <AvatarImage src={item.src} alt="" />
                    <AvatarFallback className="text-[11px] font-semibold">{item.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
            ))}
            {remaining > 0 && (
                <span className="-ml-2 flex size-8 items-center justify-center rounded-full border-2 border-brand-surface bg-brand-primary text-[11px] font-semibold text-brand-primary-foreground">
                    +{remaining}
                </span>
            )}
        </div>
    );
}
