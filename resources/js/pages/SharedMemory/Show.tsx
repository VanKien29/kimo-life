import { PhotoUploader } from '@/components/memory/photo-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import { PhotoCarousel } from '@/components/shared/photo-carousel';
import { PhotoStack } from '@/components/shared/photo-stack';
import { SinglePhoto } from '@/components/shared/single-photo';
import AppLayout from '@/layouts/app-layout';
import { type SharedMemoryPageProps, type SharedMemoryItem } from '@/types/shared-memory';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BookHeart, CalendarDays, ImagePlus, NotebookPen, Send, Trash2, UserPlus } from 'lucide-react';
import { useMemo } from 'react';

const availableReactions = ['❤️', '🔥', '👏', '✨', '😂', '🥹'];

export default function SharedMemoryShow({ sharedMemory, friends, status }: { sharedMemory: SharedMemoryItem; friends: SharedMemoryPageProps['friends']; status?: string }) {
    const photoForm = useForm<{ photos: File[] }>({ photos: [] });
    const noteForm = useForm<{ content: string }>({ content: '' });
    const inviteForm = useForm<{ user_id: string }>({ user_id: '' });
    const dateLabel = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date(`${sharedMemory.memory_date}T12:00:00`));
    const participantIds = useMemo(() => new Set(sharedMemory.participants.map((participant) => participant.user.id)), [sharedMemory.participants]);
    const availableFriends = friends.filter((friend) => !participantIds.has(friend.id));
    const avatarItems = sharedMemory.participants.map((participant) => ({
        id: participant.user.id,
        name: participant.user.name,
        src: participant.user.avatar ?? undefined,
    }));

    const addPhotos = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        photoForm.post(route('shared-memories.photos.store', sharedMemory.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => photoForm.reset(),
        });
    };

    const addNote = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        noteForm.post(route('shared-memories.notes.store', sharedMemory.id), {
            preserveScroll: true,
            onSuccess: () => noteForm.reset(),
        });
    };

    const inviteFriend = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        inviteForm.post(route('shared-memories.invite', sharedMemory.id), { preserveScroll: true, onSuccess: () => inviteForm.reset() });
    };

    const deleteSharedMemory = () => {
        if (!window.confirm('Bạn có chắc muốn xóa kỷ niệm chung này?')) return;
        router.delete(route('shared-memories.destroy', sharedMemory.id));
    };

    return (
        <AppLayout>
            <Head title={sharedMemory.title} />

            <div className="mx-auto max-w-4xl space-y-5 py-2 sm:space-y-6 sm:py-4">
                {status && <Toast title={status} />}

                <div className="flex items-center justify-between gap-3">
                    <Button asChild variant="ghost"><Link href={route('shared-memories.index')}><ArrowLeft />Kỷ niệm chung</Link></Button>
                    {sharedMemory.is_owner && <Button type="button" variant="ghost" size="icon" aria-label="Xóa kỷ niệm chung" onClick={deleteSharedMemory}><Trash2 className="text-brand-danger" /></Button>}
                </div>

                <Card className="overflow-hidden border-0">
                    {sharedMemory.photos.length === 3 ? (
                        <PhotoStack
                            photos={sharedMemory.photos as [(typeof sharedMemory.photos)[0], (typeof sharedMemory.photos)[1], (typeof sharedMemory.photos)[2]]}
                            className="bg-brand-pale max-w-none rounded-none px-5 py-5"
                        />
                    ) : sharedMemory.photos.length > 1 ? (
                        <PhotoCarousel photos={sharedMemory.photos} className="bg-brand-pale p-4" />
                    ) : sharedMemory.photos.length === 1 ? (
                        <SinglePhoto photo={sharedMemory.photos[0]} className="aspect-[4/3] rounded-none" />
                    ) : (
                        <div className="bg-brand-pale text-brand-primary-dark flex aspect-[16/7] items-center justify-center"><BookHeart className="size-10" /></div>
                    )}

                    <div className="space-y-5 p-5 sm:p-8">
                        <div>
                            <p className="text-brand-secondary flex items-center gap-1.5 text-sm"><CalendarDays className="size-4" />{dateLabel}</p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{sharedMemory.title}</h1>
                            {sharedMemory.description && <p className="text-brand-secondary mt-2 leading-6">{sharedMemory.description}</p>}
                        </div>

                        <div className="border-brand-border bg-brand-background flex flex-wrap items-center gap-4 rounded-2xl border p-4">
                            <AvatarGroup items={avatarItems} max={6} />
                            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{sharedMemory.participants.length} người cùng lưu giữ</p><p className="text-brand-secondary mt-1 text-xs">Bắt đầu bởi {sharedMemory.owner.name}</p></div>
                        </div>

                        <ReactionBar sharedMemory={sharedMemory} />

                        <section className="space-y-3" aria-labelledby="shared-memory-photos-title">
                            <div className="flex items-center justify-between gap-3"><div><p className="text-brand-primary-dark text-sm font-medium">Photo Stack</p><h2 id="shared-memory-photos-title" className="mt-1 text-xl font-bold">Ảnh của chúng ta</h2></div><span className="text-brand-secondary text-sm">{sharedMemory.photo_count}/10</span></div>
                            {sharedMemory.photos.length === 0 && <p className="text-brand-secondary rounded-2xl border border-dashed border-brand-border p-4 text-sm">Chưa có ảnh nào. Mỗi người có thể thêm một góc nhìn của mình.</p>}
                            <form onSubmit={addPhotos} className="space-y-3"><PhotoUploader value={photoForm.data.photos} onChange={(files) => photoForm.setData('photos', files)} maxPhotos={Math.max(1, 10 - sharedMemory.photo_count)} quick error={photoForm.errors.photos} /><Button type="submit" disabled={photoForm.processing || photoForm.data.photos.length === 0}><ImagePlus />{photoForm.processing ? 'Đang thêm…' : 'Thêm ảnh vào kỷ niệm'}</Button></form>
                        </section>

                        <section className="space-y-3" aria-labelledby="shared-memory-notes-title">
                            <div className="flex items-center gap-2"><NotebookPen className="text-brand-primary-dark size-5" /><div><p className="text-brand-primary-dark text-sm font-medium">Lời nhắn</p><h2 id="shared-memory-notes-title" className="mt-1 text-xl font-bold">Mỗi người một dòng nhớ</h2></div></div>
                            {sharedMemory.notes.length > 0 ? <div className="space-y-3">{sharedMemory.notes.map((note) => <NoteItem key={note.id} note={note} />)}</div> : <p className="text-brand-secondary rounded-2xl border border-dashed border-brand-border p-4 text-sm">Chưa có lời nhắn. Viết một câu để lần sau đọc lại cùng nhau.</p>}
                            <form onSubmit={addNote} className="space-y-3"><Textarea value={noteForm.data.content} onChange={(event) => noteForm.setData('content', event.target.value)} placeholder="Mình nhớ nhất là…" rows={3} /><InputError message={noteForm.errors.content} /><div className="flex justify-end"><Button type="submit" disabled={noteForm.processing || noteForm.data.content.trim() === ''}><Send />{noteForm.processing ? 'Đang lưu…' : 'Thêm lời nhắn'}</Button></div></form>
                        </section>
                    </div>
                </Card>

                {sharedMemory.is_owner && availableFriends.length > 0 && (
                    <Card className="border-0 p-5 sm:p-6">
                        <div className="flex items-start gap-3"><span className="bg-brand-pale text-brand-primary-dark rounded-xl p-2.5"><UserPlus className="size-5" /></span><div><h2 className="text-lg font-bold">Mời thêm bạn</h2><p className="text-brand-secondary mt-1 text-sm leading-6">Chỉ bạn bè đã kết nối mới có thể được mời vào không gian này.</p></div></div>
                        <form onSubmit={inviteFriend} className="mt-4 flex flex-col gap-3 sm:flex-row"><select aria-label="Chọn bạn để mời" value={inviteForm.data.user_id} onChange={(event) => inviteForm.setData('user_id', event.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-brand-border bg-brand-surface px-3.5 text-sm text-brand-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary-dark"><option value="">Chọn một người bạn…</option>{availableFriends.map((friend) => <option key={friend.id} value={friend.id}>{friend.name}{friend.username ? ` · @${friend.username}` : ''}</option>)}</select><Button type="submit" disabled={inviteForm.processing || inviteForm.data.user_id === ''}><UserPlus />Mời tham gia</Button></form><InputError message={inviteForm.errors.user_id} />
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

function ReactionBar({ sharedMemory }: { sharedMemory: SharedMemoryItem }) {
    return <div className="flex flex-wrap gap-2" aria-label="Cảm xúc của kỷ niệm chung">{availableReactions.map((reaction) => { const item = sharedMemory.reactions.find((current) => current.reaction === reaction); return <button key={reaction} type="button" aria-label={`Thả cảm xúc ${reaction}`} aria-pressed={item?.reacted ?? false} onClick={() => router.post(route('shared-memories.reactions.toggle', sharedMemory.id), { reaction }, { preserveScroll: true })} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition-[background-color,border-color,transform] active:scale-[0.97] ${item?.reacted ? 'border-brand-primary bg-brand-pale' : 'border-brand-border bg-brand-surface hover:bg-brand-background'}`}>{reaction}{item && <span className="text-brand-secondary text-xs">{item.count}</span>}</button>; })}</div>;
}

function NoteItem({ note }: { note: SharedMemoryItem['notes'][number] }) {
    const dateLabel = note.created_at ? new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(new Date(note.created_at)) : 'Vừa mới đây';

    return <div className="border-brand-border bg-brand-background flex gap-3 rounded-2xl border p-3.5"><Avatar className="size-9"><AvatarImage src={note.user.avatar ?? undefined} alt="" /><AvatarFallback className="bg-brand-pale text-brand-primary-dark text-xs font-semibold">{note.user.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="text-sm leading-6 whitespace-pre-wrap">{note.content}</p><p className="text-brand-muted mt-1 text-xs">{note.user.name} · {dateLabel}</p></div></div>;
}
