import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import { type FriendProfile } from '@/types/friendship';
import { Head, Link } from '@inertiajs/react';
import { Archive, BarChart3, Camera, ChevronRight, Flame, LogOut, Moon, UsersRound } from 'lucide-react';

export default function Profile({ profile }: { profile: FriendProfile }) {
    const initials = profile.name.trim().slice(0, 1).toUpperCase();
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    return (
        <AppLayout>
            <Head title="Cá nhân" />

            <div className="mx-auto w-full max-w-xl space-y-4 py-2 sm:space-y-5 sm:py-4">
                <Card className="overflow-hidden border-0 p-0 text-center shadow-soft">
                    <div className="relative h-36 overflow-visible sm:h-44">
                        <img src="/images/hero-landscape.jpg" alt="" className="size-full object-cover" />
                        <div className="absolute inset-0 bg-emerald-700/15" />
                        <Avatar className="absolute bottom-[-2.75rem] left-1/2 size-20 -translate-x-1/2 border-4 border-brand-surface shadow-float sm:size-24">
                            <AvatarImage src={profile.avatar ?? undefined} alt={profile.name} />
                            <AvatarFallback className="bg-brand-pale text-brand-primary-dark text-2xl font-bold sm:text-3xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="px-5 pt-14 pb-5 sm:px-7 sm:pt-16 sm:pb-7">
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{profile.name}</h1>
                        <p className="text-brand-secondary mt-0.5 text-sm">
                            {profile.username ? `@${profile.username}` : 'Chưa đặt username'}
                        </p>
                        <p className="text-brand-muted mt-2 text-xs">
                            {profile.bio || 'Đang viết tiếp câu chuyện của mình :)'}
                        </p>
                    </div>
                </Card>

                <section className="grid grid-cols-3 gap-2.5" aria-label="Tổng quan cá nhân">
                    <ProfileStat icon={Camera} label="Khoảnh khắc" value={profile.memory_count} />
                    <ProfileStat icon={Flame} label="Thói quen" value={profile.streak_count} />
                    <ProfileStat icon={UsersRound} label="Bạn bè" value={profile.friends_count} />
                </section>

                <Card className="overflow-hidden border-0 p-0 shadow-soft">
                    <ProfileLink icon={Archive} label="Kho lưu trữ" href="/memory" />
                    <ProfileLink icon={BarChart3} label="Thống kê" href="/streak" />
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isDark}
                        onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                        className="group flex min-h-14 w-full items-center gap-3 border-b border-brand-border/60 px-4 text-left transition-colors hover:bg-brand-pale/50 sm:px-5"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-pale text-brand-primary-dark">
                            <Moon className="size-4" />
                        </span>
                        <span className="flex-1 text-sm font-medium text-brand-text">Chế độ tối</span>
                        <span
                            className={`relative h-6 w-11 rounded-full p-1 transition-colors ${isDark ? 'bg-brand-primary-dark' : 'bg-brand-border'}`}
                            aria-hidden="true"
                        >
                            <span
                                className={`block size-4 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </span>
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="group flex min-h-14 w-full items-center gap-3 px-4 text-left text-brand-danger transition-colors hover:bg-brand-danger/10 sm:px-5"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-danger/10">
                            <LogOut className="size-4" />
                        </span>
                        <span className="flex-1 text-sm font-semibold">Đăng xuất</span>
                        <ChevronRight className="size-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </Card>
            </div>
        </AppLayout>
    );
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof Camera; label: string; value: number }) {
    return (
        <Card className="border-0 p-3 text-center shadow-soft sm:p-4">
            <span className="mx-auto flex size-9 items-center justify-center rounded-xl bg-brand-pale text-brand-primary-dark">
                <Icon className="size-4" />
            </span>
            <p className="mt-1.5 text-xl font-bold sm:text-2xl">{value}</p>
            <p className="text-brand-secondary mt-0.5 text-[10px] font-medium sm:text-xs">{label}</p>
        </Card>
    );
}

function ProfileLink({ icon: Icon, label, href }: { icon: typeof Archive; label: string; href: string }) {
    return (
        <Link
            href={href}
            className="group flex min-h-14 items-center gap-3 border-b border-brand-border/60 px-4 transition-colors hover:bg-brand-pale/50 sm:px-5"
        >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-pale text-brand-primary-dark">
                <Icon className="size-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-brand-text">{label}</span>
            <ChevronRight className="text-brand-muted size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}
