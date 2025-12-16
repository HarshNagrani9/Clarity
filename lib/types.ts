export interface Habit {
    id: number;
    title: string;
    description?: string;
    frequency: 'daily' | 'weekly';
    streak: number;
    completedDates: string[]; // ISO date strings
    color: string;
}

export interface Goal {
    id: number;
    title: string;
    description?: string;
    notes?: string;
    resources?: { title: string; url: string }[];
    targetDate?: string; // ISO date string
    completed: boolean;
    progress: number; // 0-100
    milestones: { title: string; completed: boolean }[];
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    completed: boolean;
}
