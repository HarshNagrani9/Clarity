"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Habit, Goal, Task, CalendarEvent } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { calculateStreak } from '@/lib/streak';

export interface AppState {
    habits: Habit[];
    goals: Goal[];
    tasks: Task[];
    events: CalendarEvent[];
    userProfile: { displayName?: string, email?: string } | null;
    recentActivities: { id: number, type: string, description: string, createdAt: string }[];
    addHabit: (habit: Omit<Habit, "id" | "streak" | "completedDates">) => void;
    toggleHabit: (id: number, date?: string) => void;
    deleteHabit: (id: number) => void;
    addGoal: (goal: Omit<Goal, "id" | "completed" | "progress">) => void;
    updateGoal: (id: number, updates: Partial<Goal>) => void;
    deleteGoal: (id: number) => void;
    addTask: (task: Omit<Task, "id" | "completed">) => void;
    updateTask: (id: number, updates: Partial<Task>) => void;
    toggleTask: (id: number) => void;
    deleteTask: (id: number) => void;
    addEvent: (event: Omit<CalendarEvent, "id">) => void;
    deleteEvent: (id: number) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [recentActivities, setRecentActivities] = useState<{ id: number, type: string, description: string, createdAt: string }[]>([]);
    const [userProfile, setUserProfile] = useState<{ displayName?: string, email?: string } | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                setUserProfile({ displayName: user.displayName || undefined, email: user.email || undefined });
                // Sync user data
                await fetch('/api/users/sync', {
                    method: 'POST',
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    })
                });
                await fetchData(user.uid);
            } else {
                setUserId(null);
                setUserProfile(null);
                setHabits([]);
                setGoals([]);
                setTasks([]);
                setEvents([]);
                setRecentActivities([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchData = async (uid: string) => {
        try {
            const [habitsRes, goalsRes, tasksRes, activitiesRes, eventsRes] = await Promise.all([
                fetch(`/api/habits?userId=${uid}`),
                fetch(`/api/goals?userId=${uid}`),
                fetch(`/api/tasks?userId=${uid}`),
                fetch(`/api/activities?userId=${uid}`),
                fetch(`/api/events?userId=${uid}`)
            ]);

            if (habitsRes.ok) setHabits(await habitsRes.json());
            if (goalsRes.ok) setGoals(await goalsRes.json());
            if (tasksRes.ok) setTasks(await tasksRes.json());
            if (activitiesRes.ok) setRecentActivities(await activitiesRes.json());
            if (eventsRes.ok) setEvents(await eventsRes.json());
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const logActivity = async (type: string, description: string) => {
        // Optimistic update
        const newActivity = { id: Date.now(), type, description, createdAt: new Date().toISOString() };
        setRecentActivities([newActivity, ...recentActivities].slice(0, 10)); // Keep top 10

        if (userId) {
            await fetch('/api/activities', {
                method: 'POST',
                body: JSON.stringify({ userId, type, description }),
            });
        }
    };

    const addHabit = async (habit: Omit<Habit, "id" | "streak" | "completedDates">) => {
        // Optimistic update for Guest Mode
        const tempId = Date.now();
        const newHabit = { ...habit, id: tempId, streak: 0, completedDates: [] };
        setHabits([...habits, newHabit]);
        // Only persist if user is logged in
        if (userId) {
            const res = await fetch('/api/habits', {
                method: 'POST',
                body: JSON.stringify({ ...habit, userId }),
            });
            if (res.ok) {
                const createdHabit = await res.json();
                // Replace temp habit with real one
                setHabits(prev => prev.map(h => h.id === tempId ? createdHabit : h));
                logActivity('habit', `Started new habit: ${createdHabit.title}`);
            }
        } else {
            logActivity('habit', `Started new habit: ${newHabit.title} (Guest)`);
        }
    };

    const toggleHabit = async (id: number, dateStr?: string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const targetDate = dateStr || new Date().toISOString().split('T')[0];
        const isCompleted = habit.completedDates.includes(targetDate);

        let newCompletedDates;
        if (isCompleted) {
            newCompletedDates = habit.completedDates.filter(d => d !== targetDate);
        } else {
            newCompletedDates = [...habit.completedDates, targetDate];
        }

        const newStreak = calculateStreak(newCompletedDates);
        const updates = { completedDates: newCompletedDates, streak: newStreak };

        // Optimistic Update
        setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));

        if (!isCompleted) {
            logActivity('habit', `Completed habit: ${habit.title}`);
        }

        if (userId) {
            await fetch(`/api/habits/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ ...updates, toggleDate: targetDate, userId: userId }),
            });
        }
    };

    const deleteHabit = async (id: number) => {
        setHabits(habits.filter(h => h.id !== id));
        if (userId) {
            await fetch(`/api/habits/${id}`, { method: 'DELETE' });
        }
    };

    const addGoal = async (goal: Omit<Goal, "id" | "completed" | "progress">) => {
        const tempId = Date.now();
        const newGoal: Goal = { ...goal, id: tempId, completed: false, progress: 0 };
        setGoals([...goals, newGoal]);

        if (userId) {
            const res = await fetch('/api/goals', {
                method: 'POST',
                body: JSON.stringify({ ...goal, userId }),
            });
            if (res.ok) {
                const createdGoal = await res.json();
                setGoals(prev => prev.map(g => g.id === tempId ? createdGoal : g));
                logActivity('goal', `Set new goal: ${createdGoal.title}`);
            }
        } else {
            logActivity('goal', `Set new goal: ${newGoal.title} (Guest)`);
        }
    };

    const updateGoal = async (id: number, updates: Partial<Goal>) => {
        setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
        if (updates.completed) {
            const goal = goals.find(g => g.id === id);
            if (goal) logActivity('goal', `Completed goal: ${goal.title}`);
        }
        if (userId) {
            await fetch(`/api/goals/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
        }
    };

    const deleteGoal = async (id: number) => {
        setGoals(goals.filter(g => g.id !== id));
        if (userId) {
            await fetch(`/api/goals/${id}`, { method: 'DELETE' });
        }
    };

    const addTask = async (task: Omit<Task, "id" | "completed">) => {
        const tempId = Date.now();
        const newTask: Task = { ...task, id: tempId, completed: false };
        setTasks([...tasks, newTask]);

        if (userId) {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ ...task, userId }),
            });
            if (res.ok) {
                const createdTask = await res.json();
                setTasks(prev => prev.map(t => t.id === tempId ? createdTask : t));
                logActivity('task', `Added task: ${createdTask.title}`);
            }
        } else {
            logActivity('task', `Added task: ${newTask.title} (Guest)`);
        }
    };

    const updateTask = async (id: number, updates: Partial<Task>) => {
        let finalUpdates = { ...updates };
        if (updates.completed === true) {
            finalUpdates.completedAt = new Date().toISOString();
        } else if (updates.completed === false) {
            finalUpdates.completedAt = undefined;
        }

        setTasks(tasks.map(t => t.id === id ? { ...t, ...finalUpdates } : t));
        if (updates.completed) {
            const task = tasks.find(t => t.id === id);
            if (task) logActivity('task', `Completed task: ${task.title}`);
        }
        if (userId) {
            await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(finalUpdates),
            });
        }
    };

    const toggleTask = async (id: number) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;
        const updates = {
            completed: newCompleted,
            completedAt: newCompleted ? new Date().toISOString() : undefined
        };
        setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));

        if (!task.completed) {
            logActivity('task', `Completed task: ${task.title}`);
        }

        if (userId) {
            await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
        }
    };

    const deleteTask = async (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
        if (userId) {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        }
    };

    const addEvent = async (event: Omit<CalendarEvent, "id">) => {
        const tempId = Date.now();
        const newEvent = { ...event, id: tempId };
        setEvents([...events, newEvent]);

        if (userId) {
            const res = await fetch('/api/events', {
                method: 'POST',
                body: JSON.stringify({ ...event, userId }),
            });
            if (res.ok) {
                const createdEvent = await res.json();
                setEvents(prev => prev.map(e => e.id === tempId ? createdEvent : e));
            }
        }
    };

    const deleteEvent = async (id: number) => {
        setEvents(events.filter(e => e.id !== id));
        if (userId) {
            await fetch(`/api/events/${id}`, { method: 'DELETE' });
        }
    };

    return (
        <AppContext.Provider value={{
            habits, goals, tasks, userProfile, recentActivities, events,
            addHabit, toggleHabit, deleteHabit,
            addGoal, updateGoal, deleteGoal,
            addTask, updateTask, toggleTask, deleteTask,
            addEvent, deleteEvent
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
