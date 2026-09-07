import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type FriendProfile, type FriendshipItem } from '@/types/friendship';
import { router } from '@inertiajs/react';
import { Check, UserPlus, UserRoundMinus, X } from 'lucide-react';

type FriendCardMode = 'search' | 'friend' | 'incoming' | 'outgoing';

interface FriendCardProps {
    profile?: FriendProfile;
    relation?: FriendshipItem;
    mode: FriendCardMode;
}

export function FriendCard({ profile, relation, mode }: FriendCardProps) {
    const user = profile ?? relation?.user;
    if (!user) return null;

    const initials = user.name.trim().slice(0, 1).toUpperCase();
    const sendRequest = () => router.post(route('friendships.store'), { friend_id: user.id }, { preserveScroll: true });
    const accept = () => relation && router.patch(route('friendships.accept', relation.id), {}, { preserveScroll: true });
    const decline = () => relation && router.patch(route('friendships.decline', relation.id), {}, { preserveScroll: true });
    const remove = () => {
        if (!relation || !window.confirm(mode === 'friend' ? 'Xóa ' + user.name + ' khỏi danh sách bạn bè?' : 'Hủy lời mời này?')) return;
        router.delete(route('friendships.destroy', relation.id), { preserveScroll: true });
    };
    const avatar = (
        <Avatar className="border-brand-border size-11 shrink-0 border-2">
            <AvatarImage src={user.avatar ?? undefined} alt="" />
            <AvatarFallback className="bg-brand-pale text-brand-primary-dark font-semibold">{initials}</AvatarFallback>
        </Avatar>
    );
    const identity = (
        <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{user.name}</h3>
            <p className="text-brand-secondary mt-0.5 truncate text-xs">{user.username ? '@' + user.username : 'Chưa đặt username'}</p>
        </div>
    );

    if (mode === 'friend') {
        return (
            <Card className="min-w-0 border-0 p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                    {avatar}
                    {identity}
                    <Button type="button" variant="outline" size="icon" aria-label="Xóa bạn" onClick={remove} className="shrink-0 text-brand-danger hover:bg-brand-danger/10">
                        <UserRoundMinus />
                    </Button>
                </div>
            </Card>
        );
    }

    if (mode === 'incoming') {
        return (
            <Card className="min-w-0 border-0 p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                    {avatar}
                    {identity}
                    <div className="flex shrink-0 gap-1.5">
                        <Button type="button" size="icon" aria-label="Chấp nhận lời mời" onClick={accept} className="bg-brand-primary text-white hover:bg-brand-primary-dark">
                            <Check />
                        </Button>
                        <Button type="button" variant="outline" size="icon" aria-label="Từ chối lời mời" onClick={decline}>
                            <X />
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    if (mode === 'outgoing') {
        return (
            <Card className="min-w-0 border-0 p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                    {avatar}
                    {identity}
                    <Button type="button" variant="outline" size="icon" aria-label="Hủy lời mời" onClick={remove} className="shrink-0">
                        <X />
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="min-w-0 border-0 p-4">
            <div className="flex min-w-0 items-start gap-3">
                {avatar}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{user.name}</h3>
                    <p className="text-brand-secondary mt-0.5 truncate text-xs">{user.username ? '@' + user.username : 'Chưa đặt username'}</p>
                    {user.bio && <p className="text-brand-secondary mt-2 line-clamp-2 text-sm leading-5">{user.bio}</p>}
                    <div className="text-brand-muted mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        <span>{user.memory_count} khoảnh khắc</span>
                        <span>{user.streak_count} chuỗi</span>
                        <span>{user.friends_count} bạn</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={sendRequest}><UserPlus />Kết bạn</Button>
            </div>
        </Card>
    );
}
