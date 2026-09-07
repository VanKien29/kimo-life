import { moodOptions } from '@/components/memory/mood-picker';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type MemoryOption, type MemorySearchFilters } from '@/types/memory';
import { Filter, RotateCcw } from 'lucide-react';

type SearchFilterKey = Exclude<keyof MemorySearchFilters, 'is_searching' | 'result_count'>;
type SearchFilterValue = string | number | null;

interface SearchFiltersProps {
    filters: MemorySearchFilters;
    activities: MemoryOption[];
    tags: string[];
    onChange: (key: SearchFilterKey, value: SearchFilterValue) => void;
    onApply: () => void;
    onReset: () => void;
}

export function SearchFilters({ filters, activities, tags, onChange, onApply, onReset }: SearchFiltersProps) {
    return (
        <div className="border-brand-border bg-brand-surface space-y-4 rounded-2xl border p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="bg-brand-pale text-brand-primary-dark rounded-xl p-2">
                        <Filter className="size-4" />
                    </span>
                    <div>
                        <p className="font-semibold">Bộ lọc nâng cao</p>
                        <p className="text-brand-secondary text-xs">Lọc trực tiếp trên máy chủ</p>
                    </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onReset}>
                    <RotateCcw />
                    Đặt lại
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="search-date-from">Từ ngày</Label>
                    <input
                        id="search-date-from"
                        type="date"
                        value={filters.date_from ?? ''}
                        onChange={(event) => onChange('date_from', event.target.value || null)}
                        className="border-brand-border bg-brand-background text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="search-date-to">Đến ngày</Label>
                    <input
                        id="search-date-to"
                        type="date"
                        value={filters.date_to ?? ''}
                        onChange={(event) => onChange('date_to', event.target.value || null)}
                        className="border-brand-border bg-brand-background text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="search-activity">Hoạt động</Label>
                    <select
                        id="search-activity"
                        value={filters.activity_id ?? ''}
                        onChange={(event) => onChange('activity_id', event.target.value ? Number(event.target.value) : null)}
                        className="border-brand-border bg-brand-background text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                    >
                        <option value="">Tất cả hoạt động</option>
                        {activities.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                                {activity.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="search-mood">Tâm trạng</Label>
                    <select
                        id="search-mood"
                        value={filters.mood}
                        onChange={(event) => onChange('mood', event.target.value)}
                        className="border-brand-border bg-brand-background text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                    >
                        <option value="">Tất cả tâm trạng</option>
                        {moodOptions.map((mood) => (
                            <option key={mood.value} value={mood.value}>
                                {mood.emoji} {mood.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="search-tag">Thẻ</Label>
                    <select
                        id="search-tag"
                        value={filters.tag}
                        onChange={(event) => onChange('tag', event.target.value)}
                        className="border-brand-border bg-brand-background text-brand-text focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                    >
                        <option value="">Tất cả thẻ</option>
                        {tags.map((tag) => (
                            <option key={tag} value={tag}>
                                #{tag}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="search-location">Địa điểm</Label>
                    <input
                        id="search-location"
                        value={filters.location}
                        onChange={(event) => onChange('location', event.target.value)}
                        placeholder="Ví dụ: Đà Lạt"
                        className="border-brand-border bg-brand-background text-brand-text placeholder:text-brand-muted focus-visible:ring-brand-primary-dark flex h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                    />
                </div>
            </div>
            <Button type="button" onClick={onApply} className="w-full sm:w-auto">
                <Filter />
                Áp dụng bộ lọc
            </Button>
        </div>
    );
}
