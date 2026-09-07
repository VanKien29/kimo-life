import { type FriendProfile } from '@/types/friendship';

export type SharedMemoryParticipantStatus = 'pending' | 'accepted' | 'declined';

export interface SharedMemoryParticipant {
    id: number;
    role: 'owner' | 'participant' | 'viewer';
    status: SharedMemoryParticipantStatus;
    joined_at: string | null;
    user: Pick<FriendProfile, 'id' | 'name' | 'username' | 'avatar'>;
}

export interface SharedMemoryPhoto {
    id: number;
    src: string;
    originalSrc?: string;
    alt: string;
    width?: number | null;
    height?: number | null;
    uploaded_by: Pick<FriendProfile, 'id' | 'name' | 'username' | 'avatar'>;
}

export interface SharedMemoryNote {
    id: number;
    content: string;
    created_at: string | null;
    user: Pick<FriendProfile, 'id' | 'name' | 'username' | 'avatar'>;
    is_mine: boolean;
}

export interface SharedMemoryReaction {
    reaction: string;
    count: number;
    reacted: boolean;
}

export interface SharedMemoryItem {
    id: number;
    title: string;
    description: string | null;
    memory_date: string;
    owner: Pick<FriendProfile, 'id' | 'name' | 'username' | 'avatar'>;
    participants: SharedMemoryParticipant[];
    photos: SharedMemoryPhoto[];
    notes: SharedMemoryNote[];
    reactions: SharedMemoryReaction[];
    photo_count: number;
    notes_count: number;
    is_owner: boolean;
}

export interface SharedMemoryInvitation {
    id: number;
    shared_memory: SharedMemoryItem;
    invited_by: Pick<FriendProfile, 'id' | 'name' | 'username' | 'avatar'>;
}

export interface SharedMemoryPageProps {
    sharedMemories: SharedMemoryItem[];
    invitations: SharedMemoryInvitation[];
    friends: FriendProfile[];
    status?: string;
}
