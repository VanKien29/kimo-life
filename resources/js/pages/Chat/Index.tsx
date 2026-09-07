import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type ChatMessage, type ChatPageProps, type ConversationItem } from '@/types/chat';
import { useEcho } from '@laravel/echo-react';
import { Head, Link, router } from '@inertiajs/react';
import { ImagePlus, MessageCircle, Paperclip, Send, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MessageBroadcast {
    message: ChatMessage;
}

function timeLabel(value: string | null): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function dateLabel(value: string | null): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
}

function ProfileAvatar({ name, avatar, className }: { name: string; avatar: string | null; className?: string }) {
    return (
        <Avatar className={className}>
            <AvatarImage src={avatar ?? undefined} alt="" />
            <AvatarFallback className="bg-brand-pale text-brand-primary-dark">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
    );
}

function ConversationRow({ item, active }: { item: ConversationItem; active: boolean }) {
    return (
        <Link href={route('chat', { conversation: item.id })} preserveScroll className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${active ? 'bg-brand-pale' : 'hover:bg-brand-pale/60'}`}>
            <ProfileAvatar name={item.name} avatar={item.avatar} className="size-11" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <span className="text-brand-muted shrink-0 text-[11px]">{timeLabel(item.last_message_at)}</span>
                </div>
                <p className="text-brand-secondary mt-1 truncate text-xs">{item.last_message ?? 'Bắt đầu một cuộc trò chuyện.'}</p>
            </div>
            {item.unread_count > 0 && <span className="bg-brand-primary min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 text-white">{item.unread_count > 9 ? '9+' : item.unread_count}</span>}
        </Link>
    );
}

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
    return (
        <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
            {!mine && <ProfileAvatar name={message.sender.name} avatar={message.sender.avatar ?? null} className="size-8" />}
            <div className={`max-w-[82%] space-y-1 ${mine ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${mine ? 'bg-brand-primary text-white rounded-br-md' : 'bg-brand-pale text-brand-text rounded-bl-md'}`}>
                    {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
                    {message.image_url && <img src={message.image_url} alt="Ảnh được gửi trong cuộc trò chuyện" className="mt-2 max-h-72 rounded-xl object-cover" />}
                    {message.shared_memory && (
                        <Link href={route('shared-memories.show', message.shared_memory.id)} className={`mt-2 block rounded-xl border p-3 ${mine ? 'border-white/30 bg-white/10' : 'border-brand-border bg-brand-surface'}`}>
                            <p className="font-semibold">{message.shared_memory.title}</p>
                            <p className={`text-xs ${mine ? 'text-white/75' : 'text-brand-secondary'}`}>{dateLabel(message.shared_memory.memory_date)}</p>
                        </Link>
                    )}
                    {message.memory && (
                        <Link href={route('memory.show', message.memory.id)} className="mt-2 flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface p-2.5">
                            {message.memory.photo_url && <img src={message.memory.photo_url} alt="" className="size-12 rounded-lg object-cover" />}
                            <span className="min-w-0">
                                <p className="font-semibold">Khoảnh khắc</p>
                                <p className="text-brand-secondary truncate text-xs">{message.memory.title || dateLabel(message.memory.memory_date)}</p>
                            </span>
                        </Link>
                    )}
                </div>
                <p className="text-brand-muted px-1 text-[11px]">{timeLabel(message.created_at)}</p>
            </div>
        </div>
    );
}

function RealtimeListener({ conversationId, onMessage }: { conversationId: number; onMessage: (message: ChatMessage) => void }) {
    useEcho<MessageBroadcast>(`conversations.${conversationId}`, '.newMessage', (payload) => onMessage(payload.message), [onMessage]);
    return null;
}

export default function ChatIndex({ conversations, activeConversation, friends, sharedMemories }: ChatPageProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(activeConversation?.messages ?? []);
    const [body, setBody] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [sharedMemoryId, setSharedMemoryId] = useState('');
    const [friendId, setFriendId] = useState('');
    const messageListRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => setMessages(activeConversation?.messages ?? []), [activeConversation?.id, activeConversation?.messages]);
    useEffect(() => {
        const list = messageListRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [messages.length, activeConversation?.id]);

    const handleRealtimeMessage = useCallback((message: ChatMessage) => {
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    }, []);

    const startConversation = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!friendId) return;
        router.post(route('chat.conversations.start'), { friend_id: friendId });
    };

    const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!activeConversation || (!body.trim() && !image && !sharedMemoryId)) return;
        router.post(route('chat.messages.store', activeConversation.id), {
            body: body.trim() || null,
            image,
            shared_memory_id: sharedMemoryId || null,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setBody('');
                setImage(null);
                setSharedMemoryId('');
                if (imageInputRef.current) imageInputRef.current.value = '';
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Trò chuyện" />
            <div className="mx-auto max-w-5xl space-y-5 py-2 sm:py-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Trò chuyện</h1>
                    <p className="text-brand-secondary mt-1 text-sm">Trò chuyện dễ dàng với bạn bè</p>
                </div>

                <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
                    <Card className="space-y-3 p-3">
                        <div className="flex items-center justify-between px-1"><p className="font-semibold">Cuộc trò chuyện</p><MessageCircle className="text-brand-primary-dark size-4" /></div>
                        {conversations.length > 0 && <div className="space-y-1">{conversations.map((item) => <ConversationRow key={item.id} item={item} active={item.id === activeConversation?.id} />)}</div>}
                        <form onSubmit={startConversation} className="border-brand-border space-y-2 border-t pt-3">
                            <label htmlFor="new-chat-friend" className="text-brand-secondary text-xs font-medium">Bắt đầu với bạn bè</label>
                            <div className="flex gap-2">
                                <select id="new-chat-friend" value={friendId} onChange={(event) => setFriendId(event.target.value)} className="border-brand-border bg-brand-surface min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary">
                                    <option value="">Chọn một người</option>
                                    {friends.map((friend) => <option key={friend.id} value={friend.id}>{friend.name}</option>)}
                                </select>
                                <Button type="submit" size="icon" aria-label="Mở cuộc trò chuyện" disabled={!friendId}><UsersRound /></Button>
                            </div>
                            {friends.length === 0 && <p className="text-brand-muted text-xs">Hãy kết nối bạn bè trước nhé.</p>}
                        </form>
                    </Card>

                    <Card className="flex min-h-[560px] flex-col overflow-hidden">
                        {activeConversation ? (
                            <>
                                <RealtimeListener conversationId={activeConversation.id} onMessage={handleRealtimeMessage} />
                                <div className="border-brand-border flex items-center gap-3 border-b p-4"><ProfileAvatar name={activeConversation.name} avatar={activeConversation.avatar} className="size-11" /><div><p className="font-semibold">{activeConversation.name}</p><p className="text-brand-secondary text-xs">Bạn bè của bạn</p></div></div>
                                <div ref={messageListRef} className="bg-brand-background/40 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                                    {messages.length === 0 ? <div className="text-brand-secondary flex h-full min-h-64 flex-col items-center justify-center text-center"><MessageCircle className="text-brand-primary-dark mb-2 size-8" /><p>Chưa có tin nhắn nào.</p><p className="text-brand-muted mt-1 text-xs">Gửi một lời chào để bắt đầu nhé.</p></div> : messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.sender.id !== activeConversation.other_user_id} />)}
                                </div>
                                <form onSubmit={sendMessage} className="border-brand-border space-y-2 border-t p-3 sm:p-4">
                                    {image && <div className="text-brand-secondary flex items-center gap-2 text-xs"><Paperclip className="size-3.5" />{image.name}<button type="button" className="text-brand-danger ml-auto" onClick={() => { setImage(null); if (imageInputRef.current) imageInputRef.current.value = ''; }}>Bỏ ảnh</button></div>}
                                    <div className="flex items-end gap-2"><Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Viết điều bạn muốn chia sẻ..." rows={2} className="min-h-14 resize-none" maxLength={5000} /><Button type="submit" size="icon" aria-label="Gửi tin nhắn" disabled={!body.trim() && !image && !sharedMemoryId}><Send /></Button></div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
                                        <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}><ImagePlus /> Ảnh</Button>
                                        {sharedMemories.length > 0 && <select value={sharedMemoryId} onChange={(event) => setSharedMemoryId(event.target.value)} className="border-brand-border bg-brand-surface text-brand-secondary rounded-lg border px-2.5 py-2 text-xs"><option value="">Đính kèm kỷ niệm chung</option>{sharedMemories.map((memory) => <option key={memory.id} value={memory.id}>{memory.title}</option>)}</select>}
                                    </div>
                                </form>
                            </>
                        ) : <div className="text-brand-secondary flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle className="text-brand-primary-dark mb-3 size-10" /><h2 className="text-brand-text text-lg font-semibold">Chọn một cuộc trò chuyện</h2><p className="mt-1 max-w-sm text-sm">Chọn người bạn ở bên trái hoặc bắt đầu một cuộc trò chuyện mới.</p></div>}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
