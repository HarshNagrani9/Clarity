"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/store";
import { Check, Target, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { habits, goals, tasks } = useApp();

    // Helper to normalize date string to YYYY-MM-DD
    const toDateString = (date?: string | Date) => {
        if (!date) return '';
        if (typeof date === 'string') return date.split('T')[0];
        try {
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    const selectedDateStr = toDateString(date);

    // Helper to check if a date has any events
    const hasEvent = (day: Date) => {
        const dayStr = toDateString(day);
        // Check habits (daily)
        const hasDailyHabit = habits.some(h => h.frequency === 'daily');
        // Check tasks due
        const hasTask = tasks.some(t => toDateString(t.dueDate) === dayStr);
        // Check goals target
        const hasGoal = goals.some(g => toDateString(g.targetDate) === dayStr);
        return hasDailyHabit || hasTask || hasGoal;
    };

    const dailyHabits = habits.filter(h => h.frequency === 'daily');
    const weeklyHabits = habits.filter(h => h.frequency === 'weekly');
    const tasksForDay = tasks.filter(t => toDateString(t.dueDate) === selectedDateStr);
    const goalsForDay = goals.filter(g => toDateString(g.targetDate) === selectedDateStr);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                <p className="text-muted-foreground">Plan and review your schedule.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <Card className="h-full">
                    <CardContent className="p-6 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border p-4 w-full max-w-[500px]"
                            modifiers={{
                                hasEvent: (day) => hasEvent(day)
                            }}
                            modifiersStyles={{
                                hasEvent: { textDecoration: "underline", fontWeight: "bold", color: "var(--primary)" }
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{date ? date.toDateString() : 'Select a date'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Daily Habits */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Check className="h-4 w-4" /> Daily Habits</h4>
                                {dailyHabits.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {dailyHabits.map(h => (
                                            <li key={h.id} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }}></div>
                                                <span className={cn(h.completedDates.includes(selectedDateStr) && "line-through text-muted-foreground")}>
                                                    {h.title}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-muted-foreground">No daily habits.</p>}
                            </div>

                            {/* Weekly Habits */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Check className="h-4 w-4" /> Weekly Habits</h4>
                                {weeklyHabits.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {weeklyHabits.map(h => (
                                            <li key={h.id} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }}></div>
                                                <span className={cn(h.completedDates.includes(selectedDateStr) && "line-through text-muted-foreground")}>
                                                    {h.title}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-muted-foreground">No weekly habits.</p>}
                            </div>

                            {/* Tasks */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><ListTodo className="h-4 w-4" /> Tasks Due</h4>
                                {tasksForDay.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {tasksForDay.map(t => (
                                            <li key={t.id} className="flex items-center gap-2">
                                                <span className={cn(t.completed && "line-through text-muted-foreground")}>{t.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-muted-foreground">No tasks due.</p>}
                            </div>

                            {/* Goals */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Target className="h-4 w-4" /> Goal Deadlines</h4>
                                {goalsForDay.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {goalsForDay.map(g => (
                                            <li key={g.id} className="flex items-center gap-2">
                                                <span>{g.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-muted-foreground">No deadlines.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
