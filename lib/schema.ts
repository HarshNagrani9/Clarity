import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const habits = pgTable('habits', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(), // Firebase User ID
    title: text('title').notNull(),
    description: text('description'),
    frequency: text('frequency').default('daily'), // daily, weekly
    completedDates: jsonb('completed_dates').default([]), // Store ISO date strings
    streak: integer('streak').default(0),
    color: text('color').default('#22c55e'), // hex color
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
    id: text('id').primaryKey(), // Firebase UID
    email: text('email').notNull(),
    displayName: text('display_name'),
    mobile: text('mobile'),
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
