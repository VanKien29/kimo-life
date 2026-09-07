import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Leaf } from 'lucide-react';

interface FoundationPlaceholderProps {
    title: string;
    description: string;
}

export function FoundationPlaceholder({ title, description }: FoundationPlaceholderProps) {
    return (
        <AppLayout>
            <Head title={title} />
            <div className="space-y-6 py-4 sm:space-y-8 sm:py-8">
                <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-brand-pale p-2.5 text-brand-primary-dark">
                        <Leaf className="size-5" />
                    </span>
                    <div>
                        <p className="text-sm font-medium text-brand-primary-dark">Nền tảng Kimo Life</p>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    </div>
                </div>
                <EmptyState
                    title="Tính năng sẽ được xây ở phase tiếp theo."
                    description={description}
                    action={
                        <Button asChild variant="outline">
                            <Link href="/today">
                                <ArrowLeft />
                                Về Hôm nay
                            </Link>
                        </Button>
                    }
                />
            </div>
        </AppLayout>
    );
}
