"use client";

import { useState } from "react";
import { format, eachDayOfInterval, subDays, startOfWeek, endOfWeek, isSameDay, subWeeks, addWeeks } from "date-fns";
import { Task } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskHeatmapProps {
    tasks: Task[];
}

export function TaskHeatmap({ tasks }: TaskHeatmapProps) {
    // Show last 6 months? or a yearly view?
    // Let's do a GitHub-style contribution graph (horizontal scrolling or fixed range).
    // Let's show last 365 days or so, but responsive.
    // For simplicity and effective UI, let's show the last 20 weeks (~5 months) which fits well.

    // Actually, let's allow navigation.
    const [endDate, setEndDate] = useState(new Date());

    // We want to show a grid of weeks.
    // Rows = Days (Sun-Sat or Mon-Sun)
    // Cols = Weeks

    const weeksToShow = 52; // Full year to fill space
    const startDate = subWeeks(endDate, weeksToShow - 1);

    // Align start date to start of week
    const calendarStart = startOfWeek(startDate);
    const calendarEnd = endOfWeek(endDate);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Group days by week for rendering columns
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    days.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    const getIntensity = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Count COMPLETED tasks on this day using 'completedAt'
        // If completedAt is missing (legacy data), we might fall back to dueDate, but for now strict.

        const count = tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            return format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr;
        }).length;

        if (count === 0) return "bg-secondary/30";
        if (count <= 2) return "bg-green-300 dark:bg-green-900";
        if (count <= 4) return "bg-green-500 dark:bg-green-700";
        return "bg-green-600 dark:bg-green-500";
    };

    const getCount = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            return format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr;
        }).length;
    };

    return (
        <div className="p-6 border rounded-xl bg-card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Productivity Heatmap</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setEndDate(d => subWeeks(d, 4))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setEndDate(d => addWeeks(d, 4))} disabled={endDate > new Date()}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-max">
                    {/* Day labels column */}
                    <div className="flex flex-col gap-1 pr-2 pt-6 text-[10px] text-muted-foreground leading-[14px]">
                        <div className="h-[14px]"></div> {/* Sun */}
                        <div className="h-[14px]">Mon</div>
                        <div className="h-[14px]"></div>
                        <div className="h-[14px]">Wed</div>
                        <div className="h-[14px]"></div>
                        <div className="h-[14px]">Fri</div>
                        <div className="h-[14px]"></div>
                    </div>

                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                            {/* Month label logic is tricky in grids, simplified: show directly above first week of month */}
                            {weekIdx === 0 || format(week[0], 'MMM') !== format(subWeeks(week[0], 1), 'MMM') ? (
                                <span className="text-[10px] text-muted-foreground h-[14px]">{format(week[0], 'MMM')}</span>
                            ) : (
                                <div className="h-[14px]"></div>
                            )}

                            {week.map((day, dayIdx) => {
                                const count = getCount(day);
                                return (
                                    <TooltipProvider key={day.toISOString()}>
                                        <Tooltip delayDuration={50}>
                                            <TooltipTrigger>
                                                <div
                                                    className={`w-[14px] h-[14px] rounded-sm transition-colors ${getIntensity(day)} hover:ring-1 hover:ring-ring`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                {count} tasks on {format(day, 'MMM d, yyyy')}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 justify-end">
                <span>Less</span>
                <div className="w-[14px] h-[14px] rounded-sm bg-secondary/30" />
                <div className="w-[14px] h-[14px] rounded-sm bg-green-300 dark:bg-green-900" />
                <div className="w-[14px] h-[14px] rounded-sm bg-green-500 dark:bg-green-700" />
                <div className="w-[14px] h-[14px] rounded-sm bg-green-600 dark:bg-green-500" />
                <span>More</span>
            </div>
        </div>
    );
}
