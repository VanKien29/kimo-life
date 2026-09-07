export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';
export type FriendshipDirection = 'incoming' | 'outgoing';

export interface FriendProfile {
    id: number;
    name: string;
    username: string | null;
    avatar: string | null;
    bio: string | null;
    memory_count: number;
    streak_count: number;
    friends_count: number;
}

export interface FriendshipItem {
    id: number;
    status: FriendshipStatus;
    direction: FriendshipDirection;
    user: FriendProfile;
}

export interface ActivityFeedItem {
    id: number;
    type: 'memory';
    actor: Pick<FriendProfile, 'id' | 'name' | 'username' | 'avatar'>;
    description: string;
    memory_id: number;
    photo_url: string | null;
    created_at: string | null;
}

export interface TogetherStats {
    friends: number;
    incoming_requests: number;
    outgoing_requests: number;
}

export interface TogetherSharedMemory {
    id: number;
    title: string;
    memory_date: string;
    photo_count: number;
    participants: Array<Pick<FriendProfile, 'id' | 'name' | 'avatar'>>;
}

export interface DuoStreakMember {
    id: number;
    name: string;
    avatar: string | null;
    completed_today: boolean;
}

export interface DuoStreakItem {
    id: number;
    name: string;
    frequency: string;
    start_date: string;
    current_streak: number;
    best_streak: number;
    status: 'active' | 'paused';
    is_owner: boolean;
    can_check_in: boolean;
    all_completed_today: boolean;
    other_member_id?: number;
    members: DuoStreakMember[];
}

export interface GroupChallengeMember {
    id: number;
    name: string;
    avatar: string | null;
    progress: number;
    progress_percent: number;
    photo_count: number;
    today_completed: boolean;
}

export interface GroupChallengeItem {
    id: number;
    name: string;
    goal: number;
    duration: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'paused';
    is_owner: boolean;
    remaining_days: number;
    can_check_in: boolean;
    members: GroupChallengeMember[];
}

export interface GroupChallengeInvitation {
    id: number;
    challenge: {
        id: number;
        name: string;
        goal: number;
        duration: number;
        invited_by: string;
    };
}

export interface GroupChallengePhoto {
    id: number;
    user_id: number;
    user_name: string;
    user_avatar: string | null;
    date: string;
    src: string | null;
    original_src: string | null;
    width: number | null;
    height: number | null;
}

export interface GroupChallengeDetail extends Omit<GroupChallengeItem, 'can_check_in' | 'members'> {
    current_user_id: number;
    can_add_photos: boolean;
    members: Array<{
        id: number;
        name: string;
        username: string | null;
        avatar: string | null;
        progress: number;
        progress_percent: number;
        photo_count: number;
    }>;
    photos: GroupChallengePhoto[];
}

export interface TogetherPageProps {
    profile: FriendProfile;
    friends: FriendshipItem[];
    incomingRequests: FriendshipItem[];
    outgoingRequests: FriendshipItem[];
    searchResults: FriendProfile[];
    searchQuery: string;
    recentActivity: ActivityFeedItem[];
    sharedMemories: TogetherSharedMemory[];
    duoStreaks: DuoStreakItem[];
    groupChallenges: GroupChallengeItem[];
    challengeInvitations: GroupChallengeInvitation[];
    sharedStreaks: unknown[];
    stats: TogetherStats;
    status?: string;
}
