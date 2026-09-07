import { X } from 'lucide-react';

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="bg-brand-pale text-brand-primary-dark inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium">
            {label}
            <button type="button" aria-label={`Bỏ bộ lọc ${label}`} onClick={onRemove} className="hover:bg-brand-surface rounded-full p-0.5">
                <X className="size-3" />
            </button>
        </span>
    );
}
