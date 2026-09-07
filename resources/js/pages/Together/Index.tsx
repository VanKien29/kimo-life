import { SearchInput } from '@/components/memory/search-input';
import { FriendCard } from '@/components/friend/friend-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { ensureCameraPermission } from '@/lib/camera-permission';
import { type DuoStreakItem, type GroupChallengeItem, type TogetherPageProps, type TogetherSharedMemory } from '@/types/friendship';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookHeart, Camera, Check, CheckCircle2, Flame, Gift, HeartHandshake, Image as ImageIcon, ImagePlus, LoaderCircle, Pause, RefreshCw, Search, Sparkles, UserPlus, UsersRound, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type TogetherTab = 'activity' | 'friends' | 'challenges';

const tabs: Array<{ value: TogetherTab; label: string; icon: typeof Search }> = [
    { value: 'activity', label: 'Hoạt động', icon: Sparkles },
    { value: 'friends', label: 'Bạn bè', icon: UsersRound },
    { value: 'challenges', label: 'Thử thách', icon: Gift },
];

export default function Together({ profile, friends, incomingRequests, outgoingRequests, searchResults, searchQuery, recentActivity, sharedMemories, duoStreaks, groupChallenges, challengeInvitations, stats, status }: TogetherPageProps) {
    const [tab, setTab] = useState<TogetherTab>('activity');
    const initials = profile.name.trim().slice(0, 1).toUpperCase();

    const searchFriends = (query: string) => {
        router.get(route('together'), query ? { q: query } : {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Cùng nhau" />

            <div className="w-full min-w-0 space-y-6 overflow-x-hidden px-1 py-2 sm:space-y-8 sm:px-0 sm:py-4">
                {status && <Toast title={status} />}

                <section className="relative overflow-hidden rounded-3xl bg-brand-surface px-5 py-6 shadow-soft sm:px-8 sm:py-8">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                        <img
                            src="/images/hero-landscape.jpg"
                            alt=""
                            className="h-full w-full object-cover object-right sm:object-center opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-surface/95 via-brand-surface/80 to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="border-brand-primary/30 size-16 border-2 shadow-soft">
                                <AvatarImage src={profile.avatar ?? undefined} alt="" />
                                <AvatarFallback className="bg-brand-pale text-brand-primary-dark text-xl font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Together</h1>
                                <p className="text-brand-secondary mt-1 text-sm">Kết nối với những người bạn tin</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:min-w-72">
                            <TogetherStat label="Bạn bè" value={stats.friends} />
                            <TogetherStat label="Kỷ niệm" value={profile.memory_count} />
                            <TogetherStat label="Chuỗi" value={profile.streak_count} />
                        </div>
                    </div>
                </section>

                <section className="space-y-3" aria-label="Tìm bạn">
                    <div className="flex items-center gap-2"><HeartHandshake className="text-brand-primary-dark size-5" /><h2 className="text-lg font-bold">Tìm một người bạn</h2></div>
                    <SearchInput value={searchQuery} onSubmit={searchFriends} placeholder="Tìm bằng tên hoặc username…" />
                    {searchQuery && (
                        <div className="space-y-3">
                            <p className="text-brand-secondary text-sm">Kết quả cho “{searchQuery}”</p>
                            {searchResults.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">{searchResults.map((user) => <FriendCard key={user.id} profile={user} mode="search" />)}</div> : <p className="text-brand-secondary rounded-2xl border border-dashed border-brand-border p-4 text-sm">Không tìm thấy người dùng mới phù hợp.</p>}
                        </div>
                    )}
                </section>

                <div className="bg-brand-surface border-brand-border flex w-full gap-1 rounded-2xl border p-1" role="tablist" aria-label="Khu vực Cùng nhau">
                    {tabs.map(({ value, label, icon: Icon }) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`inline-flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:text-sm ${tab === value ? 'bg-brand-pale text-brand-primary-dark shadow-soft' : 'text-brand-secondary hover:bg-brand-background'}`}><Icon className="size-4 shrink-0" />{label}{value === 'friends' && stats.incoming_requests > 0 && <span className="bg-brand-streak text-white inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px]">{stats.incoming_requests}</span>}</button>)}
                </div>

                {tab === 'activity' && <ActivityTab friends={friends} recentActivity={recentActivity} sharedMemories={sharedMemories} onOpenFriends={() => setTab('friends')} />}
                {tab === 'friends' && <FriendsTab friends={friends} incomingRequests={incomingRequests} outgoingRequests={outgoingRequests} />}
                {tab === 'challenges' && <ChallengesTab friends={friends} duoStreaks={duoStreaks} groupChallenges={groupChallenges} challengeInvitations={challengeInvitations} />}
            </div>
        </AppLayout>
    );
}

function TogetherStat({ label, value }: { label: string; value: number }) {
    return <div className="rounded-2xl border border-brand-border bg-white/70 px-2 py-3 text-center backdrop-blur"><p className="text-brand-secondary text-[11px]">{label}</p><p className="mt-1 text-xl font-bold text-brand-text">{value}</p></div>;
}

function ActivityTab({ friends, recentActivity, sharedMemories, onOpenFriends }: Pick<TogetherPageProps, 'friends' | 'recentActivity' | 'sharedMemories'> & { onOpenFriends: () => void }) {
    return (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="min-w-0">
                <div className="mb-3 flex items-end justify-between gap-3">
                    <div><p className="text-brand-primary-dark text-sm font-medium">Khoảnh khắc bạn bè</p><h2 className="mt-1 text-xl font-bold">Ảnh mới từ bạn bè</h2></div>
                    <span className="text-brand-muted shrink-0 text-xs">Công khai</span>
                </div>
                {recentActivity.length > 0 ? <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3">{recentActivity.map((item) => <Link key={`${item.type}-${item.id}`} href={route('memory.show', item.memory_id)} className="group relative aspect-square min-w-0 overflow-hidden rounded-xl bg-brand-pale shadow-soft"><img src={item.photo_url ?? '/images/hero-landscape.jpg'} alt="" loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" /><span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" /></Link>)}</div> : <EmptyState title="Chưa có ảnh công khai." description="Ảnh công khai của bạn bè sẽ xuất hiện ở đây." />}
            </section>

            <Card className="min-w-0 border-0 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3"><div><p className="text-brand-primary-dark text-sm font-medium">Bạn bè</p><h2 className="mt-1 text-xl font-bold">Những người đồng hành</h2></div><UsersRound className="text-brand-muted size-5" /></div>
                {friends.length > 0 ? <div className="mt-5 space-y-3">{friends.slice(0, 4).map((friendship) => <div key={friendship.id} className="flex items-center gap-3"><Avatar className="size-10"><AvatarImage src={friendship.user.avatar ?? undefined} alt="" /><AvatarFallback className="bg-brand-pale text-brand-primary-dark text-sm font-semibold">{friendship.user.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{friendship.user.name}</p><p className="text-brand-secondary text-xs">{friendship.user.streak_count} chuỗi đang giữ</p></div><CheckCircle2 className="text-brand-primary-dark size-4" /></div>)}<button type="button" onClick={onOpenFriends} className="text-brand-primary-dark mt-3 inline-flex items-center gap-1 text-sm font-semibold">Xem danh sách bạn bè <ArrowRight className="size-4" /></button></div> : <EmptyState className="mt-5" title="Chưa có bạn bè." description="Tìm một người bạn ở phía trên để bắt đầu kết nối." />}
            </Card>

            <div className="grid min-w-0 gap-5 lg:col-span-2 lg:grid-cols-2">
                <Card className="min-w-0 border-0 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="bg-brand-pale text-brand-primary-dark rounded-xl p-2.5"><BookHeart className="size-5" /></span><div><p className="text-brand-primary-dark text-sm font-medium">Shared Memories</p><h2 className="mt-1 text-lg font-bold">Kỷ niệm của chúng ta</h2></div></div>{sharedMemories.length > 0 ? <div className="mt-5 space-y-3">{sharedMemories.slice(0, 3).map((memory) => <TogetherSharedMemoryRow key={memory.id} memory={memory} />)}<Link href={route('shared-memories.index')} className="text-brand-primary-dark inline-flex items-center gap-1 text-sm font-semibold">Xem tất cả <ArrowRight className="size-4" /></Link></div> : <p className="text-brand-secondary mt-4 text-sm leading-6">Tạo một không gian để cùng thêm ảnh và lời nhắn.</p>}</Card>
                <Card className="min-w-0 border-0 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="bg-brand-pale text-brand-primary-dark rounded-xl p-2.5"><Flame className="size-5" /></span><div><h2 className="text-lg font-bold">Chuỗi chung</h2><p className="text-brand-secondary mt-1 text-sm leading-6">Những thử thách cùng nhau sẽ xuất hiện khi tính năng chuỗi đôi được mở.</p></div></div></Card>
            </div>
        </div>
    );
}

function TogetherSharedMemoryRow({ memory }: { memory: TogetherSharedMemory }) {
    const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(new Date(`${memory.memory_date}T12:00:00`));

    return <Link href={route('shared-memories.show', memory.id)} className="hover:bg-brand-pale/60 flex items-center gap-3 rounded-2xl p-2 transition"><AvatarGroup items={memory.participants.map((participant) => ({ id: participant.id, name: participant.name, src: participant.avatar ?? undefined }))} max={3} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{memory.title}</span><span className="text-brand-secondary block text-xs">{dateLabel} · {memory.photo_count} ảnh</span></span><ArrowRight className="text-brand-muted size-4" /></Link>;
}

function FriendsTab({ friends, incomingRequests, outgoingRequests }: Pick<TogetherPageProps, 'friends' | 'incomingRequests' | 'outgoingRequests'>) {
    return <div className="space-y-6">{incomingRequests.length > 0 && <FriendSection title="Lời mời đang chờ" description="Bạn có thể chấp nhận hoặc từ chối bất cứ lúc nào." items={incomingRequests} mode="incoming" />}{outgoingRequests.length > 0 && <FriendSection title="Lời mời đã gửi" description="Đang chờ người bạn này phản hồi." items={outgoingRequests} mode="outgoing" />}{friends.length > 0 ? <FriendSection title="Danh sách bạn bè" description="Chỉ những người đã chấp nhận kết nối mới xuất hiện ở đây." items={friends} mode="friend" /> : incomingRequests.length === 0 && outgoingRequests.length === 0 && <EmptyState title="Danh sách bạn bè đang trống." description="Hãy tìm một người bạn bằng tên hoặc username để bắt đầu." />}</div>;
}

function FriendSection({ title, description, items, mode }: { title: string; description: string; items: TogetherPageProps['friends']; mode: 'friend' | 'incoming' | 'outgoing' }) {
    return <section className="min-w-0 space-y-3"><div><p className="text-brand-primary-dark text-sm font-medium">{title}</p><p className="text-brand-secondary mt-1 text-sm">{description}</p></div><div className="grid min-w-0 gap-3 sm:grid-cols-2">{items.map((relation) => <FriendCard key={relation.id} relation={relation} mode={mode} />)}</div></section>;
}

function ChallengesTab({ friends, duoStreaks, groupChallenges, challengeInvitations }: Pick<TogetherPageProps, 'friends' | 'duoStreaks' | 'groupChallenges' | 'challengeInvitations'>) {
    const [duoOpen, setDuoOpen] = useState(false);
    const [challengeOpen, setChallengeOpen] = useState(false);
    const duoForm = useForm<{ name: string; friend_id: string }>({ name: '', friend_id: '' });
    const challengeForm = useForm<{ name: string; goal: string; duration: string; friend_ids: number[] }>({ name: '', goal: '30', duration: '30', friend_ids: [] });

    const submitDuo = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        duoForm.post(route('duo-streaks.store'), { onSuccess: () => { setDuoOpen(false); duoForm.reset(); } });
    };

    const submitChallenge = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        challengeForm.post(route('group-challenges.store'), { onSuccess: () => { setChallengeOpen(false); challengeForm.reset(); } });
    };

    const toggleChallengeFriend = (friendId: number) => {
        const selected = challengeForm.data.friend_ids.includes(friendId)
            ? challengeForm.data.friend_ids.filter((id) => id !== friendId)
            : [...challengeForm.data.friend_ids, friendId];
        challengeForm.setData('friend_ids', selected);
    };

    return (
        <div className="space-y-6">
            {challengeInvitations.length > 0 && <Card className="border-brand-primary/25 bg-brand-pale/35 border p-5 sm:p-6"><div className="flex items-start gap-3"><span className="bg-brand-surface text-brand-primary-dark rounded-xl p-2.5"><Gift className="size-5" /></span><div><p className="text-brand-primary-dark text-sm font-medium">Lời mời thử thách</p><h2 className="mt-1 text-lg font-bold">Bạn được mời tham gia</h2></div></div><div className="mt-4 space-y-3">{challengeInvitations.map((invitation) => <div key={invitation.id} className="bg-brand-surface flex flex-col gap-3 rounded-2xl p-3.5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{invitation.challenge.name}</p><p className="text-brand-secondary mt-1 text-xs">{invitation.challenge.invited_by} mời bạn · {invitation.challenge.duration} ngày · mục tiêu {invitation.challenge.goal} lần</p></div><div className="flex shrink-0 gap-2"><Button type="button" size="sm" onClick={() => router.patch(route('group-challenge-invitations.accept', invitation.id), {}, { preserveScroll: true })}><Check />Tham gia</Button><Button type="button" size="sm" variant="outline" onClick={() => router.patch(route('group-challenge-invitations.decline', invitation.id), {}, { preserveScroll: true })}><X />Từ chối</Button></div></div>)}</div></Card>}
            <Card className="border-0 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3"><span className="bg-brand-accent/45 text-orange-900 rounded-xl p-2.5"><Gift className="size-5" /></span><div><h2 className="text-lg font-bold">Cùng nhau, vừa đủ</h2><p className="text-brand-secondary mt-1 max-w-xl text-sm leading-6">Tạo một nhịp nhỏ với một người bạn hoặc rủ cả nhóm. Mỗi người tiến bộ theo cách của mình.</p></div></div>
                    <div className="flex shrink-0 flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setDuoOpen(true)}><Flame />Chuỗi đôi</Button><Button type="button" onClick={() => setChallengeOpen(true)}><Gift />Thử thách nhóm</Button></div>
                </div>
            </Card>

            <section className="space-y-3" aria-labelledby="duo-streaks-title">
                <div><p className="text-brand-primary-dark text-sm font-medium">Duo Streak</p><h2 id="duo-streaks-title" className="mt-1 text-xl font-bold tracking-tight">Giữ nhịp cùng một người bạn</h2></div>
                {duoStreaks.length > 0 ? <div className="grid gap-4 lg:grid-cols-2">{duoStreaks.map((duo) => <DuoStreakCard key={duo.id} duo={duo} />)}</div> : <EmptyState title="Chưa có chuỗi đôi." description="Chọn một người bạn và bắt đầu bằng một việc nhỏ mỗi ngày." action={<Button type="button" variant="outline" onClick={() => setDuoOpen(true)}><Flame />Tạo chuỗi đôi</Button>} />}
            </section>

            <section className="space-y-3" aria-labelledby="group-challenges-title">
                <div><p className="text-brand-primary-dark text-sm font-medium">Group Challenge</p><h2 id="group-challenges-title" className="mt-1 text-xl font-bold tracking-tight">Thử thách không cần so hơn thua</h2></div>
                {groupChallenges.length > 0 ? <div className="grid gap-4 lg:grid-cols-2">{groupChallenges.map((challenge) => <GroupChallengeCard key={challenge.id} challenge={challenge} />)}</div> : <EmptyState title="Chưa có thử thách nhóm." description="Rủ vài người bạn cùng hoàn thành một mục tiêu trong khoảng thời gian vừa sức." action={<Button type="button" variant="outline" onClick={() => setChallengeOpen(true)}><Gift />Tạo thử thách</Button>} />}
            </section>

            <Dialog open={duoOpen} onOpenChange={setDuoOpen}>
                <DialogContent className="rounded-3xl border-brand-border bg-brand-surface sm:max-w-md">
                    <DialogHeader><DialogTitle>Tạo chuỗi đôi</DialogTitle><DialogDescription>Hai bạn cùng check-in mỗi ngày. Chuỗi chỉ tăng khi cả hai cùng hoàn thành.</DialogDescription></DialogHeader>
                    <form onSubmit={submitDuo} className="space-y-5"><div className="space-y-2"><label htmlFor="duo-name" className="text-sm font-semibold">Tên chuỗi</label><Input id="duo-name" value={duoForm.data.name} onChange={(event) => duoForm.setData('name', event.target.value)} placeholder="Ví dụ: Coding Together" autoFocus /><InputError message={duoForm.errors.name} /></div><div className="space-y-2"><label htmlFor="duo-friend" className="text-sm font-semibold">Người đồng hành</label><select id="duo-friend" value={duoForm.data.friend_id} onChange={(event) => duoForm.setData('friend_id', event.target.value)} className="h-11 w-full rounded-xl border border-brand-border bg-brand-surface px-3.5 text-sm text-brand-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary-dark"><option value="">Chọn một người bạn…</option>{friends.map((friendship) => <option key={friendship.user.id} value={friendship.user.id}>{friendship.user.name}</option>)}</select><InputError message={duoForm.errors.friend_id} /></div><DialogFooter><Button type="button" variant="ghost" onClick={() => setDuoOpen(false)}>Để sau</Button><Button type="submit" disabled={duoForm.processing || duoForm.data.friend_id === ''}>{duoForm.processing ? 'Đang tạo…' : 'Bắt đầu chuỗi'}</Button></DialogFooter></form>
                </DialogContent>
            </Dialog>

            <Dialog open={challengeOpen} onOpenChange={setChallengeOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-brand-border bg-brand-surface sm:max-w-lg">
                    <DialogHeader><DialogTitle>Tạo thử thách nhóm</DialogTitle><DialogDescription>Mỗi người có tiến độ riêng; mục tiêu là cùng duy trì nhịp, không phải đứng đầu.</DialogDescription></DialogHeader>
                    <form onSubmit={submitChallenge} className="space-y-5"><div className="space-y-2"><label htmlFor="challenge-name" className="text-sm font-semibold">Tên thử thách</label><Input id="challenge-name" value={challengeForm.data.name} onChange={(event) => challengeForm.setData('name', event.target.value)} placeholder="Ví dụ: 30 ngày đọc sách" autoFocus /><InputError message={challengeForm.errors.name} /></div><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="challenge-goal" className="text-sm font-semibold">Mục tiêu mỗi người</label><Input id="challenge-goal" type="number" min={1} max={365} value={challengeForm.data.goal} onChange={(event) => challengeForm.setData('goal', event.target.value)} /><InputError message={challengeForm.errors.goal} /></div><div className="space-y-2"><label htmlFor="challenge-duration" className="text-sm font-semibold">Thời lượng (ngày)</label><Input id="challenge-duration" type="number" min={1} max={365} value={challengeForm.data.duration} onChange={(event) => challengeForm.setData('duration', event.target.value)} /><InputError message={challengeForm.errors.duration} /></div></div><InputError message={challengeForm.errors.friend_ids} /><div className="space-y-2"><p className="text-sm font-semibold">Mời bạn bè <span className="text-brand-muted font-normal">(tuỳ chọn)</span></p>{friends.length > 0 ? <div className="grid gap-2 sm:grid-cols-2">{friends.map((friendship) => { const selected = challengeForm.data.friend_ids.includes(friendship.user.id); return <button key={friendship.user.id} type="button" onClick={() => toggleChallengeFriend(friendship.user.id)} className={`flex items-center gap-2 rounded-2xl border p-3 text-left text-sm transition ${selected ? 'border-brand-primary bg-brand-pale' : 'border-brand-border hover:bg-brand-background'}`}><span className={`flex size-5 items-center justify-center rounded-full border ${selected ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-border text-transparent'}`}><Check className="size-3" /></span>{friendship.user.name}</button>; })}</div> : <p className="text-brand-secondary text-sm">Bạn chưa có bạn bè để mời.</p>}</div><DialogFooter><Button type="button" variant="ghost" onClick={() => setChallengeOpen(false)}>Để sau</Button><Button type="submit" disabled={challengeForm.processing}>{challengeForm.processing ? 'Đang tạo…' : 'Bắt đầu thử thách'}</Button></DialogFooter></form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DuoStreakCard({ duo }: { duo: DuoStreakItem }) {
    const waitingMember = duo.members.find((member) => !member.completed_today);

    return <Card className="border-0 p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-brand-primary-dark text-sm font-medium">{duo.frequency === 'daily' ? 'Mỗi ngày' : duo.frequency}</p><h3 className="mt-1 text-lg font-bold">{duo.name}</h3></div><span className="bg-brand-pale text-brand-primary-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"><Flame className="size-3.5" />{duo.current_streak} ngày</span></div><div className="mt-5 space-y-3">{duo.members.map((member) => <div key={member.id} className="flex items-center gap-3"><Avatar className="size-9"><AvatarImage src={member.avatar ?? undefined} alt="" /><AvatarFallback className="bg-brand-pale text-brand-primary-dark text-xs font-semibold">{member.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><span className="min-w-0 flex-1 truncate text-sm font-semibold">{member.name}</span>{member.completed_today ? <CheckCircle2 className="text-brand-primary-dark size-5" aria-label="Đã check-in" /> : <span className="text-brand-muted text-xs">Chưa check-in</span>}</div>)}</div><p className="text-brand-secondary mt-4 text-sm leading-6">{duo.all_completed_today ? 'Cả hai đã hoàn thành hôm nay. Hẹn gặp lại vào ngày mai.' : waitingMember && waitingMember.id !== duo.members[0]?.id ? `${waitingMember.name} chưa check-in hôm nay.` : 'Bạn chưa check-in hôm nay.'}</p><div className="mt-4 flex flex-wrap gap-2">{duo.can_check_in && <Button type="button" size="sm" onClick={() => router.post(route('duo-streaks.check-in', duo.id), {}, { preserveScroll: true })}><Check />Check-in hôm nay</Button>}{!duo.all_completed_today && duo.other_member_id && <Button type="button" size="sm" variant="outline" onClick={() => router.post(route('duo-streaks.remind', duo.id), { to_user_id: duo.other_member_id }, { preserveScroll: true })}><UserPlus />Nhắc bạn</Button>}{duo.is_owner && <Button type="button" size="sm" variant="ghost" onClick={() => router.patch(route('duo-streaks.deactivate', duo.id))}><Pause />Tạm dừng</Button>}</div></Card>;
}

function GroupChallengeCard({ challenge }: { challenge: GroupChallengeItem }) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <>
            <Card className="relative border-0 p-5 sm:p-6">
                {challenge.is_owner && <button type="button" aria-label="Xóa thử thách" onClick={() => setDeleteOpen(true)} className="text-brand-muted hover:text-brand-danger absolute top-4 right-4 rounded-full p-1.5 transition-colors"><X className="size-4" /></button>}
                <div className="flex items-start justify-between gap-3 pr-7"><div><p className="text-brand-primary-dark text-sm font-medium">Còn {challenge.remaining_days} ngày</p><h3 className="mt-1 text-lg font-bold">{challenge.name}</h3></div><span className="bg-brand-accent/45 text-orange-950 rounded-full px-2.5 py-1 text-xs font-semibold">{challenge.goal} lần</span></div>
                <div className="mt-5 space-y-4">{challenge.members.map((member) => <div key={member.id}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate font-semibold">{member.name}</span><span className="text-brand-secondary shrink-0">{member.progress}/{challenge.goal} · {member.photo_count} ảnh</span></div><div className="bg-brand-pale h-2 overflow-hidden rounded-full"><div className="bg-brand-primary h-full rounded-full transition-[width] duration-300" style={{ width: `${member.progress_percent}%` }} /></div></div>)}</div>
                <div className="mt-5 grid grid-cols-2 gap-2">{challenge.can_check_in && <Button type="button" size="sm" className="w-full" onClick={() => setUploadOpen(true)}><Check />Check-in</Button>}<Button asChild type="button" size="sm" variant="outline" className="w-full"><Link href={route('group-challenges.show', challenge.id)}><ImagePlus />Xem</Link></Button></div>
            </Card>

            <ChallengeCheckInDialog challengeId={challenge.id} open={uploadOpen} onOpenChange={setUploadOpen} />
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><DialogContent className="rounded-3xl border-brand-border bg-brand-surface sm:max-w-sm"><DialogHeader><DialogTitle>Xóa thử thách?</DialogTitle><DialogDescription>Toàn bộ tiến độ và ảnh trong thử thách “{challenge.name}” sẽ bị xóa.</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>Hủy</Button><Button type="button" variant="destructive" onClick={() => router.delete(route('group-challenges.destroy', challenge.id), { onSuccess: () => setDeleteOpen(false) })}>Xóa thử thách</Button></DialogFooter></DialogContent></Dialog>
        </>
    );
}

function ChallengeCheckInDialog({ challengeId, open, onOpenChange }: { challengeId: number; open: boolean; onOpenChange: (open: boolean) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<'camera' | 'preview'>('camera');
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraStarting, setCameraStarting] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const form = useForm<{ photos: File[] }>({ photos: [] });

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraReady(false);
    }, []);

    useEffect(() => {
        if (!open || step !== 'camera') {
            stopCamera();
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Trình duyệt không hỗ trợ camera trực tiếp.');
            return;
        }
        let cancelled = false;
        setCameraStarting(true);
        setCameraError(null);
        void ensureCameraPermission().then((permissionGranted) => {
            if (!permissionGranted) {
                setCameraError('Bạn chưa cấp quyền camera. Hãy cho phép camera rồi thử lại.');
                return null;
            }

            return navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 1280 } } });
        }).then((stream) => {
            if (!stream) return;
            if (cancelled) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            streamRef.current = stream;
            if (!videoRef.current) return;
            videoRef.current.srcObject = stream;
            return videoRef.current.play().then(() => {
                if (!cancelled) setCameraReady(true);
            });
        }).catch(() => setCameraError('Không thể mở camera. Hãy cấp quyền camera hoặc chọn ảnh từ thiết bị.')).finally(() => setCameraStarting(false));

        return () => {
            cancelled = true;
            stopCamera();
        };
    }, [facingMode, open, step, stopCamera]);

    const close = () => {
        stopCamera();
        form.reset();
        setPreviewUrl(null);
        setStep('camera');
        onOpenChange(false);
    };

    const capture = () => {
        const video = videoRef.current;
        if (!video || !cameraReady) return;
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1440 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], `challenge-${Date.now()}.jpg`, { type: 'image/jpeg' });
            form.setData('photos', [file]);
            setPreviewUrl(URL.createObjectURL(blob));
            stopCamera();
            setStep('preview');
        }, 'image/jpeg', 0.92);
    };

    const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        form.setData('photos', [file]);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
        setStep('preview');
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('group-challenges.check-in', challengeId), { forceFormData: true, preserveScroll: true, onSuccess: close });
    };

    return <Dialog open={open} onOpenChange={(value) => value ? onOpenChange(true) : close()}><DialogContent className="rounded-3xl border-white/10 bg-[#111614] p-4 text-white sm:max-w-md"><DialogHeader><DialogTitle className="text-white">Check-in hôm nay</DialogTitle><DialogDescription className="text-white/65">Chụp một ảnh để lưu lại tiến trình của bạn.</DialogDescription></DialogHeader>{step === 'camera' ? <div className="space-y-4"><div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-black"><video ref={videoRef} autoPlay playsInline muted className={`size-full object-cover transition-opacity ${cameraReady ? 'opacity-100' : 'opacity-0'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />{cameraStarting && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/80"><LoaderCircle className="size-6 animate-spin" />Đang mở camera…</div>}{cameraError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center text-sm text-white/80"><Camera className="size-8" /><span>{cameraError}</span><Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><ImageIcon />Chọn ảnh</Button></div>}</div><div className="flex items-center justify-between gap-4"><Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Chọn ảnh"><ImageIcon /></Button><button type="button" onClick={capture} disabled={!cameraReady} aria-label="Chụp ảnh" className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-white/15 shadow-[0_0_0_6px_rgb(255_255_255_/_0.15)] disabled:opacity-50"><span className="size-14 rounded-full bg-white" /></button><Button type="button" variant="outline" size="icon" onClick={() => { setCameraError(null); setFacingMode((current) => current === 'environment' ? 'user' : 'environment'); }} aria-label="Đổi camera"><RefreshCw /></Button></div><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={selectFile} /></div> : <form onSubmit={submit} className="space-y-4"><div className="overflow-hidden rounded-3xl bg-black"><img src={previewUrl ?? ''} alt="Ảnh check-in" className="aspect-[3/4] size-full object-cover" /></div><div className="flex gap-2"><Button type="button" variant="outline" className="flex-1" onClick={() => { setPreviewUrl(null); form.setData('photos', []); setStep('camera'); }}><ArrowLeft />Chụp lại</Button><Button type="submit" className="flex-1" disabled={form.processing}><Check />{form.processing ? 'Đang lưu…' : 'Check-in'}</Button></div></form>}</DialogContent></Dialog>;
}
