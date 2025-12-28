import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const habits = pgTable('habits', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(), // Firebase User ID
    title: text('title').notNull(),
    description: text('description'),
    frequency: text('frequency').default('daily'), // daily, weekly, custom
    frequencyDays: jsonb('frequency_days').default([]), // [0,1,2,3,4,5,6] for custom days
    completedDates: jsonb('completed_dates').default([]), // Store ISO date strings
    streak: integer('streak').default(0),
    color: text('color').default('#22c55e'), // hex color
    startDate: timestamp('start_date').defaultNow(),
    endDate: timestamp('end_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
    id: text('id').primaryKey(), // Firebase UID
    email: text('email').notNull(),
    displayName: text('display_name'),
    mobile: text('mobile'),
    preferences: jsonb('preferences').default({}), // Store user settings like view modes
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const activities = pgTable('activities', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    type: text('type').notNull(), // 'habit', 'goal', 'task', 'auth'
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const goals = pgTable('goals', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    notes: text('notes'), // Rich text/markdown
    resources: jsonb('resources').default([]), // Array of { title, url }
    targetDate: timestamp('target_date'),
    completed: boolean('completed').default(false),
    progress: integer('progress').default(0), // 0-100
    milestones: jsonb('milestones').default([]), // Array of { title, completed }
    createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    priority: text('priority').default('medium'), // low, medium, high
    dueDate: timestamp('due_date'),
    completed: boolean('completed').default(false),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const habitCompletions = pgTable('habit_completions', {
    id: serial('id').primaryKey(),
    habitId: integer('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
    userId: text('user_id').notNull(),
    date: text('date').notNull(), // ISO YYYY-MM-DD
    createdAt: timestamp('created_at').defaultNow(),
});

export const weeklyReports = pgTable('weekly_reports', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    weekStart: text('week_start').notNull(), // ISO YYYY-MM-DD of Monday
    totalHabits: integer('total_habits').default(0),
    totalCompleted: integer('total_completed').default(0),
    completionRate: integer('completion_rate').default(0), // Percentage
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const monthlyReports = pgTable('monthly_reports', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    month: text('month').notNull(), // MM or Month Name? Let's use YYYY-MM for sorting
    totalHabits: integer('total_habits').default(0),
    totalCompleted: integer('total_completed').default(0),
    completionRate: integer('completion_rate').default(0), // Percentage
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    date: text('date').notNull(), // ISO YYYY-MM-DD
    time: text('time'), // HH:mm or optional
    link: text('link'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const otpCodes = pgTable('otp_codes', {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const pushSubscriptions = pgTable('push_subscriptions', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    endpoint: text('endpoint').notNull().unique(),
    keys: jsonb('keys').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
