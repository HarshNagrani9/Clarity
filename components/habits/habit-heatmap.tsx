"use client";

import React, { useState } from 'react';
import { Habit } from "@/lib/types";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths, isToday, startOfDay, isSameWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HabitHeatmapProps {
    habit: Habit;
    onToggleDate: (date: string) => void;
}

export function HabitHeatmap({ habit, onToggleDate }: HabitHeatmapProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const isCompleted = (date: Date) => {
        const isoDate = format(date, 'yyyy-MM-dd');
        return habit.completedDates.includes(isoDate);
    };

    const isInteractive = (date: Date) => {
        // Strict Mode: Can only check-in for Today, regardless of frequency.
        return isToday(date);
    };

    return (
        <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-6 w-6">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-6 w-6">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i}>{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {daysInMonth.map((date) => {
                    const completed = isCompleted(date);
                    const start = habit.startDate ? new Date(habit.startDate) : null;
                    const end = habit.endDate ? new Date(habit.endDate) : null;

                    // Check bounds
                    const beforeStart = start && date < startOfDay(start);
                    const afterEnd = end && date > startOfDay(end);
                    const outOfBounds = beforeStart || afterEnd;

                    const interactive = isInteractive(date) && !outOfBounds;

                    return (
                        <div
                            key={date.toISOString()}
                            className={cn(
                                "aspect-square rounded-sm flex items-center justify-center text-xs transition-colors border border-transparent",
                                !completed && !outOfBounds && "bg-muted/30",
                                interactive && "cursor-pointer hover:bg-muted",
                                !interactive && "cursor-default opacity-50",
                                isToday(date) && "ring-1 ring-primary ring-offset-background"
                            )}
                            style={completed ? { backgroundColor: habit.color, color: '#fff' } : {}}
                            onClick={() => interactive && onToggleDate(format(date, 'yyyy-MM-dd'))}
                        >
                            {completed && <Check className="h-3 w-3" />}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color }} /> Done</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-muted/30" /> Pending</span>
                <span className="ml-auto text-[10px] opacity-70">
                    Check-in available for Today only
                </span>
            </div>
        </div>
    );
}
