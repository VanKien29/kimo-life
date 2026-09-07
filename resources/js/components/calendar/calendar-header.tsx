import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
    label: string;
    previous: string;
    next: string;
}

export function CalendarHeader({ label, previous, next }: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-brand-primary-dark text-sm font-medium">Lịch của bạn</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{label}</h1>
            </div>
            <div className="flex items-center gap-1">
                <Link
                    href={`/calendar?month=${previous}`}
                    aria-label="Tháng trước"
                    className="text-brand-secondary hover:bg-brand-pale hover:text-brand-primary-dark inline-flex size-10 items-center justify-center rounded-full transition-colors"
                >
                    <ChevronLeft className="size-5" />
                </Link>
                <Link
                    href={`/calendar?month=${next}`}
                    aria-label="Tháng sau"
                    className="text-brand-secondary hover:bg-brand-pale hover:text-brand-primary-dark inline-flex size-10 items-center justify-center rounded-full transition-colors"
                >
                    <ChevronRight className="size-5" />
                </Link>
            </div>
        </div>
    );
}
