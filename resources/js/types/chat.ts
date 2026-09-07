export interface ChatProfile {
    id: number;
    name: string;
    username?: string | null;
    avatar?: string | null;
}

export interface SharedMemoryPreview {
    id: number;
    title: string;
    memory_date: string | null;
}

export interface MemoryMessagePreview {
    id: number;
    title: string | null;
    memory_date: string | null;
    photo_url: string | null;
}

export interface ChatMessage {
    id: number;
    conversation_id: number;
    body: string | null;
    image_url: string | null;
    shared_memory: SharedMemoryPreview | null;
    memory: MemoryMessagePreview | null;
    sender: ChatProfile;
    created_at: string | null;
}

export interface ConversationItem {
    id: number;
    name: string;
    avatar: string | null;
    other_user_id?: number;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

export interface ActiveConversation {
    id: number;
    name: string;
    avatar: string | null;
    other_user_id?: number;
    messages: ChatMessage[];
}

export type ChatFriend = ChatProfile;
export type ChatSharedMemory = SharedMemoryPreview;

export interface ChatPageProps {
    conversations: ConversationItem[];
    activeConversation: ActiveConversation | null;
    friends: ChatFriend[];
    sharedMemories: ChatSharedMemory[];
}
