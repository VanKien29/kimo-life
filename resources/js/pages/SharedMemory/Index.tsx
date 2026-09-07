import { PhotoUploader } from '@/components/memory/photo-uploader';
import { SharedMemoryCard } from '@/components/shared-memory/shared-memory-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type SharedMemoryPageProps } from '@/types/shared-memory';
import { Head, router, useForm } from '@inertiajs/react';
import { BookHeart, Check, ImagePlus, UsersRound, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

function localDate(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

export default function SharedMemoryIndex({ sharedMemories, invitations, friends, status }: SharedMemoryPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const reduceMotion = useReducedMotion();
    const form = useForm<{ title: string; description: string; memory_date: string; friend_ids: number[]; photos: File[] }>({
        title: '',
        description: '',
        memory_date: localDate(),
        friend_ids: [],
        photos: [],
    });

    const resetForm = () => {
        form.reset();
        form.setData('memory_date', localDate());
        form.clearErrors();
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('shared-memories.store'), {
            forceFormData: true,
            onSuccess: () => {
                setCreateOpen(false);
                resetForm();
            },
        });
    };

    const toggleFriend = (friendId: number) => {
        const selected = form.data.friend_ids.includes(friendId)
            ? form.data.friend_ids.filter((id) => id !== friendId)
            : [...form.data.friend_ids, friendId];
        form.setData('friend_ids', selected);
    };

    return (
        <AppLayout>
            <Head title="Kỷ niệm chung" />

            <div className="space-y-6 py-2 sm:space-y-8 sm:py-4">
                {status && <Toast title={status} />}

                <motion.section
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-primary text-brand-primary-foreground shadow-float relative overflow-hidden rounded-3xl px-5 py-6 sm:px-8 sm:py-8"
                >
                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-xl">
                            <span className="text-brand-primary-dark mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium">
                                <BookHeart className="size-3.5" />
                                Our Memory
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Những điều mình cùng nhớ</h1>
                            <p className="text-brand-primary-foreground/80 mt-2 text-sm leading-6 sm:text-base">
                                Tạo một góc nhỏ để bạn và những người thân cùng thêm ảnh, lời nhắn và cảm xúc.
                            </p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setCreateOpen(true)} className="text-brand-primary-dark border-white/60 bg-white/90 hover:bg-white">
                            <ImagePlus />
                            Tạo kỷ niệm chung
                        </Button>
                    </div>
                    <div aria-hidden="true" className="absolute -right-12 -bottom-24 size-64 rounded-full bg-white/10" />
                </motion.section>

                {invitations.length > 0 && (
                    <section className="space-y-3" aria-labelledby="shared-memory-invitations-title">
                        <div>
                            <p className="text-brand-primary-dark text-sm font-medium">Đang chờ bạn</p>
                            <h2 id="shared-memory-invitations-title" className="mt-1 text-xl font-bold tracking-tight">Lời mời kỷ niệm chung</h2>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-2">
                            {invitations.map((invitation) => (
                                <InvitationCard key={invitation.id} invitation={invitation} />
                            ))}
                        </div>
                    </section>
                )}

                <section className="space-y-3" aria-labelledby="shared-memory-list-title">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-brand-primary-dark text-sm font-medium">Không gian của chúng ta</p>
                            <h2 id="shared-memory-list-title" className="mt-1 text-xl font-bold tracking-tight">Kỷ niệm chung</h2>
                        </div>
                        {sharedMemories.length > 0 && <span className="text-brand-secondary text-sm">{sharedMemories.length} không gian</span>}
                    </div>

                    {sharedMemories.length === 0 ? (
                        <EmptyState
                            title="Chưa có kỷ niệm chung nào."
                            description="Mời một người bạn cùng lưu lại chuyến đi, một ngày đặc biệt hoặc những điều rất nhỏ."
                            action={<Button type="button" onClick={() => setCreateOpen(true)}><UsersRound />Tạo không gian đầu tiên</Button>}
                        />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                            {sharedMemories.map((sharedMemory) => <SharedMemoryCard key={sharedMemory.id} sharedMemory={sharedMemory} />)}
                        </div>
                    )}
                </section>
            </div>

            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-brand-border bg-brand-surface sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Tạo kỷ niệm chung</DialogTitle>
                        <DialogDescription>Đặt tên cho không gian, chọn người bạn muốn mời. Ảnh có thể thêm ngay hoặc sau.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="shared-memory-title" className="text-sm font-semibold">Tên kỷ niệm</label>
                            <Input id="shared-memory-title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="Ví dụ: Chuyến đi Đà Lạt" autoFocus />
                            <InputError message={form.errors.title} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="shared-memory-description" className="text-sm font-semibold">Mô tả <span className="text-brand-muted font-normal">(tuỳ chọn)</span></label>
                            <Textarea id="shared-memory-description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder="Một câu ngắn để cả nhóm nhớ về nơi này…" rows={3} />
                            <InputError message={form.errors.description} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="shared-memory-date" className="text-sm font-semibold">Ngày của kỷ niệm</label>
                            <Input id="shared-memory-date" type="date" max={localDate()} value={form.data.memory_date} onChange={(event) => form.setData('memory_date', event.target.value)} />
                            <InputError message={form.errors.memory_date} />
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-semibold">Mời bạn bè <span className="text-brand-muted font-normal">(tuỳ chọn)</span></p>
                                <p className="text-brand-secondary mt-1 text-xs">Chỉ những người đã là bạn của bạn mới có thể được mời.</p>
                            </div>
                            {friends.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {friends.map((friend) => {
                                        const selected = form.data.friend_ids.includes(friend.id);

                                        return (
                                            <button key={friend.id} type="button" onClick={() => toggleFriend(friend.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-[background-color,border-color,transform] active:scale-[0.98] ${selected ? 'border-brand-primary bg-brand-pale' : 'border-brand-border bg-brand-surface hover:bg-brand-background'}`}>
                                                <Avatar className="size-9"><AvatarImage src={friend.avatar ?? undefined} alt="" /><AvatarFallback className="text-xs font-semibold">{friend.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
                                                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{friend.name}</span><span className="text-brand-secondary block truncate text-xs">@{friend.username ?? 'ban-moi'}</span></span>
                                                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-border text-transparent'}`}><Check className="size-3.5" /></span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : <p className="text-brand-secondary rounded-2xl border border-dashed border-brand-border p-4 text-sm">Bạn chưa có bạn bè để mời. Bạn có thể tạo trước rồi mời sau.</p>}
                            <InputError message={form.errors.friend_ids} />
                        </div>
                        <PhotoUploader value={form.data.photos} onChange={(files) => form.setData('photos', files)} maxPhotos={10} />

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Để sau</Button>
                            <Button type="submit" disabled={form.processing}>{form.processing ? 'Đang tạo…' : 'Tạo kỷ niệm'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function InvitationCard({ invitation }: { invitation: SharedMemoryPageProps['invitations'][number] }) {
    const sharedMemory = invitation.shared_memory;

    return (
        <Card className="flex flex-col gap-4 border-0 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
                <span className="bg-brand-pale text-brand-primary-dark flex size-11 shrink-0 items-center justify-center rounded-2xl"><BookHeart className="size-5" /></span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{sharedMemory.title}</p>
                    <p className="text-brand-secondary mt-1 truncate text-xs">{invitation.invited_by.name} đã mời bạn tham gia</p>
                </div>
            </div>
            <div className="flex shrink-0 gap-2">
                <Button type="button" size="sm" onClick={() => router.patch(route('shared-memory-invitations.accept', invitation.id))}><Check />Tham gia</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => router.patch(route('shared-memory-invitations.decline', invitation.id))}><X />Bỏ qua</Button>
            </div>
        </Card>
    );
}
