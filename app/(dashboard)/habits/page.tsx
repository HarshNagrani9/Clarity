"use client";

import { useApp } from "@/lib/store";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitTrends } from "@/components/habits/habit-trends";

import { useState } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HabitsPage() {
    const { habits, addHabit, toggleHabit, deleteHabit } = useApp();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handlePrevDay = () => setSelectedDate(curr => subDays(curr, 1));
    const handleNextDay = () => setSelectedDate(curr => addDays(curr, 1));

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const displayDate = format(selectedDate, 'EEEE, MMMM do');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Habit Tracker</h2>
                    <p className="text-muted-foreground">Build consistency with daily and weekly habits.</p>
                </div>
                <div className="w-full md:w-auto flex justify-end">
                    <AddHabitDialog onAdd={addHabit} />
                </div>
            </div>

            <div className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
                <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg">{displayDate}</span>
                <Button variant="ghost" size="icon" onClick={handleNextDay} disabled={isSameDay(selectedDate, new Date())}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <HabitTrends habits={habits} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {habits.map(habit => (
                    <HabitCard
                        key={habit.id}
                        habit={habit}
                        selectedDate={formattedDate}
                        onDelete={deleteHabit}
                    />
                ))}
            </div>
        </div>
    );
}
