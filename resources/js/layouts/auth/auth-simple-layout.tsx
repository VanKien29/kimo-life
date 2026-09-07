import { FloatingLeaves } from '@/components/shared/floating-leaves';
import { Logo } from '@/components/shared/logo';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="kimo-shell bg-brand-background flex min-h-svh flex-col items-center justify-center gap-6 p-5 md:p-10">
            <FloatingLeaves count={4} className="opacity-20" />

            <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                {/* Left side — Illustration */}
                <div className="hidden lg:block">
                    <div className="overflow-hidden rounded-[2rem] border border-brand-border bg-brand-pale/60 shadow-soft">
                        <img
                            src="/images/onboarding-illustration.jpg"
                            alt="Minh họa Kimo Life"
                            className="h-full w-full object-cover"
                        />
                        <div className="bg-white/80 px-6 py-4 backdrop-blur">
                            <Logo variant="full" tagline />
                            <p className="text-brand-secondary mt-2 text-sm italic">
                                "Better Days Ahead :)"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side — Form */}
                <div className="w-full max-w-sm justify-self-center">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                <Logo variant="full" />
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-bold">{title}</h1>
                                <p className="text-brand-secondary text-center text-sm">{description}</p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
