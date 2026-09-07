import { FloatingLeaves } from '@/components/shared/floating-leaves';
import { Logo } from '@/components/shared/logo';
import { PhotoStack3D } from '@/components/shared/photo-stack-3d';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart3, Camera, Flame, UsersRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'Community', href: '#' },
    { label: 'About', href: '#' },
] as const;

const features = [
    { icon: Camera, label: 'Lưu khoảnh khắc', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Flame, label: 'Giữ chuỗi', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: UsersRound, label: 'Kết nối cùng nhau', color: 'text-brand-primary-dark', bg: 'bg-brand-pale' },
    { icon: BarChart3, label: 'Tiến bộ mỗi ngày', color: 'text-indigo-500', bg: 'bg-indigo-50' },
] as const;

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const reduceMotion = useReducedMotion();

    return (
        <>
            <Head title="Chào mừng" />
            <div className="kimo-shell min-h-screen bg-brand-background text-brand-text">
                <FloatingLeaves count={5} />

                {/* Hero Background Landscape */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/hero-landscape.jpg"
                        alt=""
                        className="h-full w-full object-cover opacity-25"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-background/60 via-brand-background/80 to-brand-background" />
                </div>

                {/* Header */}
                <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
                    <Link href={route('home')} aria-label="Kimo Life">
                        <Logo variant="full" />
                    </Link>
                    <nav className="hidden items-center gap-6 md:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-brand-secondary transition-colors hover:text-brand-primary-dark"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild variant="pill" size="sm">
                                <Link href={route('today')}>Mở Kimo Life</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                                    <Link href={route('login')}>Đăng nhập</Link>
                                </Button>
                                <Button asChild variant="pill" size="sm">
                                    <Link href={route('register')}>Get Started</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:pb-24 lg:pt-14">
                    <motion.section
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="max-w-xl"
                    >
                        <h1 className="kimo-display text-5xl font-bold leading-[1.06] sm:text-6xl lg:text-[4.25rem]">
                            Small moments.
                            <br />
                            <span className="text-brand-primary-dark">A better you.</span>
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-brand-secondary sm:text-lg">
                            Lưu lại những khoảnh khắc nhỏ,
                            <br className="hidden sm:block" />
                            tạo nên một cuộc sống lớn.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button asChild variant="pill" size="lg">
                                <Link href={auth.user ? route('today') : route('register')}>
                                    {auth.user ? 'Mở Hôm nay' : 'Bắt đầu ngay'}
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </motion.section>

                    {/* Hero Right — Photo Stack */}
                    <motion.section
                        aria-label="Minh họa Kimo Life"
                        className="relative hidden lg:block"
                        initial={reduceMotion ? false : { opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 25, delay: 0.2 }}
                    >
                        <PhotoStack3D />

                        {/* Decorative floating text */}
                        <motion.div
                            className="absolute -top-4 right-2 rounded-2xl bg-white/85 px-4 py-2.5 shadow-soft backdrop-blur"
                            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <p className="text-sm font-semibold text-brand-primary-dark italic">A brighter</p>
                            <p className="text-sm font-semibold text-brand-primary-dark italic">everyday</p>
                        </motion.div>
                    </motion.section>

                    {/* Mobile photo stack */}
                    <section className="relative py-6 lg:hidden" aria-label="Minh họa">
                        <PhotoStack3D className="min-h-[280px]" />
                    </section>
                </main>

                {/* Features Section */}
                <section
                    id="features"
                    className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8"
                >
                    <motion.div
                        className="flex items-center justify-center gap-8 sm:gap-14"
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {features.map(({ icon: Icon, label, color, bg }) => (
                            <div key={label} className="flex flex-col items-center gap-2 text-center">
                                <span className={`flex size-12 items-center justify-center rounded-2xl ${bg} sm:size-14`}>
                                    <Icon className={`size-5 ${color} sm:size-6`} />
                                </span>
                                <span className="max-w-20 text-xs font-medium text-brand-text sm:text-sm">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        className="mt-12 flex justify-center"
                        animate={reduceMotion ? {} : { y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    >
                        <svg className="size-6 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 10l5 5 5-5" />
                        </svg>
                    </motion.div>
                </section>
            </div>
        </>
    );
}
