export interface Habit {
    id: number;
    title: string;
    description?: string;
    frequency: 'daily' | 'weekly' | 'custom';
    frequencyDays?: number[]; // 0-6
    streak: number;
    completedDates: string[]; // ISO date strings
    color: string;
    startDate?: string;
    endDate?: string;
}

export interface Goal {
    id: number;
    title: string;
    description?: string;
    notes?: string;
    resources?: { title: string; url: string }[];
    startDate?: string; // ISO date string
    targetDate?: string; // ISO date string
    completed: boolean;
    progress: number; // 0-100
    milestones: {
        title: string;
        completed: boolean;
        targetDate?: string;
        description?: string;
        notes?: string;
        resources?: { title: string; url: string }[];
    }[];
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    completed: boolean;
    progress: number;
    completedAt?: string; // ISO date string
}

export interface CalendarEvent {
    id: number;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    time?: string;
    link?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    preferences?: {
        goalsView?: 'standard' | 'schedule';
    };
}
