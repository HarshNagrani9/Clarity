"use client";

import { useApp } from "@/lib/store";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";
import { HabitCard } from "@/components/habits/habit-card";

export default function HabitsPage() {
    const { habits, addHabit, toggleHabit, deleteHabit } = useApp();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Habit Tracker</h2>
                    <p className="text-muted-foreground">Build consistency with daily and weekly habits.</p>
                </div>
                <AddHabitDialog onAdd={addHabit} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {habits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} />
                ))}
            </div>
        </div>
    );
}
