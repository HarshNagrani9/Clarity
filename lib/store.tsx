"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Habit, Goal, Task } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export interface AppState {
    habits: Habit[];
    goals: Goal[];
    tasks: Task[];
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
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
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
                setRecentActivities([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchData = async (uid: string) => {
        try {
            const [habitsRes, goalsRes, tasksRes, activitiesRes] = await Promise.all([
                fetch(`/api/habits?userId=${uid}`),
                fetch(`/api/goals?userId=${uid}`),
                fetch(`/api/tasks?userId=${uid}`),
                fetch(`/api/activities?userId=${uid}`)
            ]);

            if (habitsRes.ok) setHabits(await habitsRes.json());
            if (goalsRes.ok) setGoals(await goalsRes.json());
            if (tasksRes.ok) setTasks(await tasksRes.json());
            if (activitiesRes.ok) setRecentActivities(await activitiesRes.json());
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const logActivity = async (type: string, description: string) => {
        if (!userId) return;
        // Optimistic update
        const newActivity = { id: Date.now(), type, description, createdAt: new Date().toISOString() };
        setRecentActivities([newActivity, ...recentActivities].slice(0, 10)); // Keep top 10

        await fetch('/api/activities', {
            method: 'POST',
            body: JSON.stringify({ userId, type, description }),
        });
    };

    const addHabit = async (habit: Omit<Habit, "id" | "streak" | "completedDates">) => {
        if (!userId) return;
        const res = await fetch('/api/habits', {
            method: 'POST',
            body: JSON.stringify({ ...habit, userId }),
        });
        if (res.ok) {
            const newHabit = await res.json();
            setHabits([...habits, newHabit]);
            logActivity('habit', `Started new habit: ${newHabit.title}`);
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

        // Recalculate streak (Optimistic/Simple logic: Tagging random past dates might break sleek streak calc logic, but fine for now)
        // Advanced logic would be to recalculate based on consecutive days looking back from today.
        // For now, let's keep streak simple: Current Streak based on looking back from *today*.

        // Simple streak recalc:
        let streak = 0;
        const sortedDates = [...newCompletedDates].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        // If today is completed, streak starts from today. If not, maybe yesterday? 
        // Let's simplified: just count consecutive days backwards from today (or yesterday).

        // Use date-fns for robustness if needed, but string comparison works for ISO yyyy-mm-dd
        // This is a naive implementation, real streak logic usually runs on server or more complex util. 
        // We'll leave streak existing logic or just increment/decrement based on *today's* action if targetDate == today.

        let newStreak = habit.streak;
        if (targetDate === new Date().toISOString().split('T')[0]) {
            newStreak = isCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1;
        }

        const updates = { completedDates: newCompletedDates, streak: newStreak };

        // Optimistic Update
        setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));

        if (!isCompleted) {
            logActivity('habit', `Completed habit: ${habit.title}`);
        }

        await fetch(`/api/habits/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ ...updates, toggleDate: targetDate, userId: userId }), // Send toggleDate and userId
        });
    };

    const deleteHabit = async (id: number) => {
        setHabits(habits.filter(h => h.id !== id));
        await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    };

    const addGoal = async (goal: Omit<Goal, "id" | "completed" | "progress">) => {
        if (!userId) return;
        const res = await fetch('/api/goals', {
            method: 'POST',
            body: JSON.stringify({ ...goal, userId }),
        });
        if (res.ok) {
            const newGoal = await res.json();
            setGoals([...goals, newGoal]);
            logActivity('goal', `Set new goal: ${newGoal.title}`);
        }
    };

    const updateGoal = async (id: number, updates: Partial<Goal>) => {
        setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
        if (updates.completed) {
            const goal = goals.find(g => g.id === id);
            if (goal) logActivity('goal', `Completed goal: ${goal.title}`);
        }
        await fetch(`/api/goals/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    };

    const deleteGoal = async (id: number) => {
        setGoals(goals.filter(g => g.id !== id));
        await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    };

    const addTask = async (task: Omit<Task, "id" | "completed">) => {
        if (!userId) return;
        const res = await fetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({ ...task, userId }),
        });
        if (res.ok) {
            const newTask = await res.json();
            setTasks([...tasks, newTask]);
            logActivity('task', `Added task: ${newTask.title}`);
        }
    };

    const updateTask = async (id: number, updates: Partial<Task>) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
        if (updates.completed) {
            const task = tasks.find(t => t.id === id);
            if (task) logActivity('task', `Completed task: ${task.title}`);
        }
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    };

    const toggleTask = async (id: number) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const updates = { completed: !task.completed };
        setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));

        if (!task.completed) {
            logActivity('task', `Completed task: ${task.title}`);
        }

        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    };

    const deleteTask = async (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    };

    return (
        <AppContext.Provider value={{
            habits, goals, tasks, userProfile, recentActivities,
            addHabit, toggleHabit, deleteHabit,
            addGoal, updateGoal, deleteGoal,
            addTask, updateTask, toggleTask, deleteTask
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
