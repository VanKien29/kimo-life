import { FloatingLeaves } from '@/components/shared/floating-leaves';
import { BottomNavigation } from '@/components/shared/bottom-navigation';
import { Logo } from '@/components/shared/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { pageMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, Clock3, House, UsersRound } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

const desktopLinks = [
    { label: 'Hôm nay', href: '/today', icon: House },
    { label: 'Lịch', href: '/calendar', icon: CalendarDays },
    { label: 'Cùng nhau', href: '/together', icon: UsersRound },
    { label: 'Lời nhắc', href: '/reminders', icon: Clock3 },
] as const;

export default function AppLayout({ children }: AppLayoutProps) {
    const page = usePage<SharedData>();
    const reduceMotion = useReducedMotion();
    const user = page.props.auth.user;

    return (
        <div className="kimo-shell bg-brand-background text-brand-text min-h-screen">
            <FloatingLeaves count={4} className="opacity-30" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
                <header className="flex h-16 w-full shrink-0 items-center justify-between gap-4 sm:h-20 md:h-24">
                    <Link href="/today" aria-label="Kimo Life — Hôm nay" className="shrink-0 rounded-xl">
                        <Logo variant="full" />
                    </Link>

                    <nav aria-label="Điều hướng máy tính" className="kimo-glass hidden items-center gap-1 rounded-full p-1 md:flex">
                        {desktopLinks.map((item) => {
                            const Icon = item.icon;
                            const active = page.url === item.href || page.url.startsWith(`${item.href}/`);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-[background-color,color,transform] hover:-translate-y-0.5',
                                        active
                                            ? 'bg-brand-pale text-brand-primary-dark'
                                            : 'text-brand-secondary hover:bg-brand-pale/70 hover:text-brand-primary-dark',
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link href={route('notifications.index')} aria-label={`Thông báo${page.props.notifications.unread_count ? `, ${page.props.notifications.unread_count} chưa đọc` : ''}`} className="text-brand-secondary hover:bg-brand-pale relative rounded-full p-2 hover:text-brand-primary-dark">
                            <Bell className="size-5" />
                            {page.props.notifications.unread_count > 0 && <span className="bg-brand-primary absolute -top-0.5 -right-0.5 min-w-4 rounded-full px-1 text-center text-[10px] leading-4 text-white">{page.props.notifications.unread_count > 9 ? '9+' : page.props.notifications.unread_count}</span>}
                        </Link>
                        <Link href="/profile" aria-label="Mở hồ sơ" className="rounded-full">
                            <Avatar className="border-brand-surface shadow-soft size-10 border-2 ring-2 ring-brand-pale">
                                <AvatarImage src={user.avatar ?? undefined} alt="" />
                                <AvatarFallback className="bg-brand-pale text-brand-primary-dark text-sm font-semibold">
                                    {user.name.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 pb-28 md:pb-5">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={page.url}
                            initial={reduceMotion ? false : 'initial'}
                            animate="animate"
                            exit={reduceMotion ? undefined : 'exit'}
                            variants={pageMotion}
                            className="mx-auto w-full max-w-6xl"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <BottomNavigation />
            </div>
        </div>
    );
}
