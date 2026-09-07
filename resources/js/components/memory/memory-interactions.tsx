import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type MemoryComment, type MemoryItem, type MemoryReaction } from '@/types/memory';
import { router } from '@inertiajs/react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

const reactionOptions = ['❤️', '🔥', '👏', '✨', '😂', '🥹'];

function relativeTime(value: string | null): string {
    if (!value) return 'Vừa xong';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function MemoryInteractions({ memory }: { memory: MemoryItem }) {
    const [reactions, setReactions] = useState<MemoryReaction[]>(memory.reactions ?? []);
    const [comments, setComments] = useState<MemoryComment[]>(memory.comments ?? []);
    const [content, setContent] = useState('');

    useEffect(() => setReactions(memory.reactions ?? []), [memory.reactions]);
    useEffect(() => setComments(memory.comments ?? []), [memory.comments]);

    const toggleReaction = (reaction: string) => {
        setReactions((current) => current.map((item) => item.reaction === reaction
            ? { ...item, count: item.count + (item.reacted ? -1 : 1), reacted: !item.reacted }
            : item));
        router.post(route('memory.reactions.toggle', memory.id), { reaction }, {
            preserveScroll: true,
            onError: () => setReactions(memory.reactions ?? []),
        });
    };

    const submitComment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) return;

        router.post(route('memory.comments.store', memory.id), { content: trimmed }, {
            preserveScroll: true,
            onSuccess: () => setContent(''),
        });
    };

    const deleteComment = (commentId: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
        router.delete(route('memory.comments.destroy', [memory.id, commentId]), {
            preserveScroll: true,
            onSuccess: () => setComments((current) => current.filter((comment) => comment.id !== commentId)),
        });
    };

    return (
        <section className="border-brand-border border-t pt-5" aria-label="Tương tác với khoảnh khắc">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircle className="text-brand-primary-dark size-4" />
                Cảm xúc và bình luận
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {reactionOptions.map((reaction) => {
                    const item = reactions.find((entry) => entry.reaction === reaction) ?? { reaction, count: 0, reacted: false };
                    return (
                        <button
                            key={reaction}
                            type="button"
                            aria-label={`Bày tỏ ${reaction}`}
                            aria-pressed={item.reacted}
                            onClick={() => toggleReaction(reaction)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition-transform hover:-translate-y-0.5 ${item.reacted ? 'border-brand-primary bg-brand-pale shadow-soft' : 'border-brand-border bg-brand-surface'}`}
                        >
                            {reaction} <span className="text-brand-secondary">{item.count}</span>
                        </button>
                    );
                })}
            </div>

            <form className="mt-5 flex items-end gap-2" onSubmit={submitComment}>
                <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Viết một bình luận nhẹ nhàng..." rows={2} className="min-h-16 resize-none" maxLength={1000} />
                <Button type="submit" size="icon" aria-label="Gửi bình luận" disabled={!content.trim()}>
                    <Send />
                </Button>
            </form>

            <div className="mt-4 space-y-3">
                {comments.length === 0 ? (
                    <p className="text-brand-secondary text-sm">Chưa có bình luận nào.</p>
                ) : comments.map((comment) => (
                    <div key={comment.id} className="bg-brand-pale/60 flex gap-3 rounded-2xl p-3">
                        <Avatar className="size-9">
                            <AvatarImage src={comment.user.avatar ?? undefined} alt="" />
                            <AvatarFallback>{comment.user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold">{comment.user.name}</p>
                                    <p className="text-brand-muted text-xs">{relativeTime(comment.created_at)}</p>
                                </div>
                                {comment.is_mine && (
                                    <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Xóa bình luận" onClick={() => deleteComment(comment.id)}>
                                        <Trash2 className="text-brand-danger size-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
