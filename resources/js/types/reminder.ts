export interface ReminderItem {
    id: number;
    type: string;
    title: string;
    time: string;
    days_of_week: number[];
    enabled: boolean;
    timezone: string;
    payload: Record<string, unknown>;
}

export interface ReminderType {
    label: string;
    icon: string;
    description: string;
}

export interface ReminderPageProps {
    reminders: ReminderItem[];
    types: Record<string, ReminderType>;
    timezone: string;
    status?: string;
}
