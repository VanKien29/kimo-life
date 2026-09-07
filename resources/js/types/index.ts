import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    kimo: { app_name: string; tagline: string };
    auth: Auth;
    notifications: { unread_count: number };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username?: string | null;
    bio?: string | null;
    avatar?: string | null;
    timezone?: string;
    locale?: string;
    onboarding_completed_at?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
