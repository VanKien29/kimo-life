import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface SearchInputProps {
    value: string;
    onSubmit: (value: string) => void;
    placeholder?: string;
}

export function SearchInput({ value, onSubmit, placeholder = 'Tìm trong khoảnh khắc…' }: SearchInputProps) {
    const [draft, setDraft] = useState(value);

    useEffect(() => setDraft(value), [value]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(draft.trim());
    };

    return (
        <form onSubmit={submit} className="relative" role="search">
            <Search className="text-brand-secondary pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                aria-label="Tìm kiếm khoảnh khắc"
                className="bg-brand-surface h-12 rounded-2xl pr-11 pl-10"
            />
            {draft && (
                <button
                    type="button"
                    aria-label="Xóa nội dung tìm kiếm"
                    onClick={() => {
                        setDraft('');
                        onSubmit('');
                    }}
                    className="text-brand-secondary hover:bg-brand-pale absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full"
                >
                    <X className="size-4" />
                </button>
            )}
        </form>
    );
}
