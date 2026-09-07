import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

interface TagInputProps {
    value: string[];
    suggestions?: string[];
    onChange: (value: string[]) => void;
}

export function TagInput({ value, suggestions = [], onChange }: TagInputProps) {
    const [draft, setDraft] = useState('');

    const addTag = (candidate = draft) => {
        const tag = candidate.trim().replace(/^#/, '');

        if (!tag || value.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase()) || value.length >= 10) return;

        onChange([...value, tag]);
        setDraft('');
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addTag();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ví dụ: cuối-tuần"
                    aria-label="Tên thẻ"
                />
                <Button type="button" variant="outline" onClick={() => addTag()} disabled={!draft.trim()}>
                    Thêm
                </Button>
            </div>
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className="bg-brand-pale/70 text-brand-primary-dark hover:bg-brand-pale rounded-full px-3 py-1 text-xs"
                        >
                            #{suggestion}
                        </button>
                    ))}
                </div>
            )}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2" aria-label="Thẻ đã chọn">
                    {value.map((tag) => (
                        <span
                            key={tag}
                            className="bg-brand-pale text-brand-primary-dark inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                        >
                            #{tag}
                            <button
                                type="button"
                                onClick={() => onChange(value.filter((item) => item !== tag))}
                                aria-label={`Xóa thẻ ${tag}`}
                                className="hover:bg-brand-surface rounded-full"
                            >
                                <X className="size-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
