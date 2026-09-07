import { PhotoUploader } from '@/components/memory/photo-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type GroupChallengeDetail } from '@/types/friendship';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, ImagePlus, X } from 'lucide-react';
import { useState } from 'react';

export default function Challenge({ challenge, status }: { challenge: GroupChallengeDetail; status?: string }) {
    const photoForm = useForm<{ photos: File[] }>({ photos: [] });
    const [openMemberId, setOpenMemberId] = useState<number | null>(challenge.current_user_id);
    const [viewer, setViewer] = useState<{ memberId: number; index: number } | null>(null);
    const dateLabel = `${formatDate(challenge.start_date)} – ${formatDate(challenge.end_date)}`;
    const viewerPhotos = viewer ? challenge.photos.filter((photo) => photo.user_id === viewer.memberId) : [];
    const viewerPhoto = viewerPhotos[viewer?.index ?? 0];

    const addPhotos = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        photoForm.post(route('group-challenges.photos.store', challenge.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => photoForm.reset(),
        });
    };

    return (
        <AppLayout>
            <Head title={challenge.name} />

            <div className="mx-auto w-full max-w-4xl space-y-5 py-2 sm:space-y-6 sm:py-4">
                {status && <Toast title={status} />}

                <div className="flex items-center justify-between gap-3">
                    <Button asChild variant="ghost"><Link href={route('together')}><ArrowLeft />Thử thách</Link></Button>
                    <span className="bg-brand-pale text-brand-primary-dark rounded-full px-3 py-1 text-xs font-semibold">{challenge.status === 'active' ? 'Đang diễn ra' : 'Đã tạm dừng'}</span>
                </div>

                <Card className="border-0 p-5 shadow-soft sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div><p className="text-brand-primary-dark text-sm font-medium">Thử thách nhóm</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{challenge.name}</h1><p className="text-brand-secondary mt-2 flex items-center gap-1.5 text-sm"><CalendarDays className="size-4" />{dateLabel} · mục tiêu {challenge.goal} lần/người</p></div>
                        <div className="bg-brand-pale/70 rounded-2xl px-4 py-3 text-left sm:text-right"><p className="text-brand-secondary text-xs">Tổng thành viên</p><p className="mt-1 text-2xl font-bold">{challenge.members.length}</p></div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {challenge.members.map((member) => (
                            <div key={member.id} className="border-brand-border bg-brand-background min-w-0 rounded-2xl border p-3.5">
                                <div className="flex items-center gap-3"><Avatar className="size-10 shrink-0"><AvatarImage src={member.avatar ?? undefined} alt="" /><AvatarFallback className="bg-brand-pale text-brand-primary-dark text-sm font-semibold">{member.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{member.name}</p><p className="text-brand-secondary truncate text-xs">{member.username ? '@' + member.username : 'Thành viên'}</p></div><span className="text-brand-primary-dark shrink-0 text-sm font-bold">{member.progress}/{challenge.goal}</span></div>
                                <div className="bg-brand-pale mt-3 h-2 overflow-hidden rounded-full"><div className="bg-brand-primary h-full rounded-full transition-[width] duration-300" style={{ width: `${member.progress_percent}%` }} /></div>
                                <p className="text-brand-muted mt-2 text-xs">{member.photo_count} ảnh đã lưu</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {challenge.can_add_photos && (
                    <Card className="border-0 p-5 shadow-soft sm:p-6">
                        <div className="flex items-start gap-3"><span className="bg-brand-pale text-brand-primary-dark rounded-xl p-2.5"><ImagePlus className="size-5" /></span><div><h2 className="text-lg font-bold">Thêm ảnh vào hôm nay</h2><p className="text-brand-secondary mt-1 text-sm leading-6">Mỗi thành viên có thể lưu nhiều ảnh trong cùng một ngày. Ảnh sẽ nằm trong album riêng của bạn.</p></div></div>
                        <form onSubmit={addPhotos} className="mt-5 space-y-3"><PhotoUploader value={photoForm.data.photos} onChange={(files) => photoForm.setData('photos', files)} maxPhotos={6} quick error={photoForm.errors.photos} /><Button type="submit" disabled={photoForm.processing || photoForm.data.photos.length === 0}><Check />{photoForm.processing ? 'Đang lưu…' : 'Lưu ảnh hôm nay'}</Button></form>
                    </Card>
                )}

                <Card className="border-0 p-5 shadow-soft sm:p-6">
                    <div><p className="text-brand-primary-dark text-sm font-medium">Album thử thách</p><h2 className="mt-1 text-xl font-bold">Ảnh theo từng thành viên</h2><p className="text-brand-secondary mt-1 text-sm">Mỗi người có một khu vực riêng, ảnh được nhóm theo người và ngày tải lên.</p></div>
                    <div className="mt-6 space-y-7">
                        {challenge.members.map((member) => {
                            const memberPhotos = challenge.photos.filter((photo) => photo.user_id === member.id);
                            const isOpen = openMemberId === member.id;

                            return <section key={member.id} className="border-brand-border overflow-hidden rounded-2xl border" aria-labelledby={`challenge-member-${member.id}`}><button type="button" onClick={() => setOpenMemberId(isOpen ? null : member.id)} className="hover:bg-brand-pale/40 flex w-full items-center gap-3 p-3.5 text-left transition-colors"><Avatar className="size-9 shrink-0"><AvatarImage src={member.avatar ?? undefined} alt="" /><AvatarFallback className="bg-brand-pale text-brand-primary-dark text-xs font-semibold">{member.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span id={`challenge-member-${member.id}`} className="block truncate text-sm font-semibold">{member.name}</span><span className="text-brand-secondary block text-xs">{memberPhotos.length} ảnh · {member.progress}/{challenge.goal} lần</span></span><span className={`text-brand-primary-dark text-xl transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span></button><div className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="border-brand-border min-h-0 overflow-hidden border-t p-3.5">{memberPhotos.length > 0 ? <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{memberPhotos.map((photo, index) => <button key={photo.id} type="button" onClick={() => setViewer({ memberId: member.id, index })} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-pale text-left"><img src={photo.src ?? '/images/hero-landscape.jpg'} alt={`Ảnh của ${photo.user_name} ngày ${formatDate(photo.date)}`} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-5 text-[10px] font-medium text-white">{formatDate(photo.date)}</span></button>)}</div> : <p className="border-brand-border text-brand-secondary rounded-2xl border border-dashed p-4 text-sm">Chưa có ảnh nào trong thử thách.</p>}</div></div></section>;
                        })}
                    </div>
                </Card>
            </div>

            <Dialog open={viewer !== null} onOpenChange={(open) => !open && setViewer(null)}>
                <DialogContent className="border-white/10 bg-[#111614] p-3 text-white sm:max-w-2xl">
                    <DialogHeader className="sr-only"><DialogTitle>Xem ảnh check-in</DialogTitle><DialogDescription>Ảnh check-in của một thành viên trong thử thách.</DialogDescription></DialogHeader>
                    {viewerPhoto && <div className="relative overflow-hidden rounded-2xl bg-black"><img src={viewerPhoto.original_src ?? viewerPhoto.src ?? '/images/hero-landscape.jpg'} alt={`Ảnh của ${viewerPhoto.user_name}`} className="max-h-[75vh] w-full object-contain" /><button type="button" aria-label="Đóng" onClick={() => setViewer(null)} className="absolute top-3 right-3 rounded-full bg-black/55 p-2 text-white"><X className="size-4" /></button>{viewerPhotos.length > 1 && <><button type="button" aria-label="Ảnh trước" onClick={() => setViewer((current) => current ? { ...current, index: (current.index - 1 + viewerPhotos.length) % viewerPhotos.length } : current)} className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white"><ChevronLeft /></button><button type="button" aria-label="Ảnh tiếp theo" onClick={() => setViewer((current) => current ? { ...current, index: (current.index + 1) % viewerPhotos.length } : current)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white"><ChevronRight /></button></>}</div>}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function formatDate(date: string | null): string {
    if (!date) return 'Chưa xác định';

    return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
}
