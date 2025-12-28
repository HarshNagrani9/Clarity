"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GoalCalendarProps {
    goals: Goal[];
}

export function GoalCalendar({ goals }: GoalCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showCompleted, setShowCompleted] = useState(true);

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));

    // Generate all days to display in the grid (including padding days from prev/next months)
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Helper to find items for a specific date
    const getItemsForDate = (date: Date) => {
        const items: { type: 'goal' | 'milestone', title: string, color?: string, isCompleted: boolean }[] = [];

        goals.forEach(goal => {
            // Check Goal Target
            if (goal.targetDate && isSameDay(new Date(goal.targetDate), date)) {
                if (!showCompleted && goal.completed) return; // Skip if hidden

                items.push({
                    type: 'goal',
                    title: `${goal.completed ? "Achieved" : "Target"}: ${goal.title}`,
                    color: goal.completed ? 'bg-green-600' : 'bg-primary',
                    isCompleted: goal.completed
                });
            }

            // Check Milestones
            goal.milestones.forEach(milestone => {
                if (milestone.targetDate && isSameDay(new Date(milestone.targetDate), date)) {
                    if (!showCompleted && milestone.completed) return; // Skip if hidden

                    items.push({
                        type: 'milestone',
                        title: `${milestone.completed ? "Completed" : "Due"}: ${milestone.title} (${goal.title})`,
                        color: milestone.completed ? 'bg-green-500' : 'bg-orange-500',
                        isCompleted: milestone.completed
                    });
                }
            });
        });

        return items;
    };

    const selectedItems = selectedDate ? getItemsForDate(selectedDate) : [];

    return (
        <>
            <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="pr-8 leading-normal">
                            {selectedDate && format(selectedDate, "EEEE, MMMM do, yyyy")}
                        </DialogTitle>
                        <DialogDescription>
                            Agenda for the day
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedItems.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No goals or milestones visible for this day.</p>
                        ) : (
                            <div className="space-y-3">
                                {selectedItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                        <div className={cn("w-3 h-3 rounded-full shrink-0", item.color)} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 space-y-0 pb-4">
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <CardTitle className="text-xl font-bold whitespace-nowrap">
                            {format(currentMonth, "MMMM yyyy")}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="text-xs h-7 px-2 shrink-0"
                        >
                            {showCompleted ? "Hide Completed" : "Show Completed"}
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm font-medium text-muted-foreground">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 auto-rows-[80px]">
                        {days.map((day, dayIdx) => {
                            const items = getItemsForDate(day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "p-1 border rounded-md relative flex flex-col gap-1 overflow-hidden transition-colors hover:bg-accent/10 cursor-pointer hover:border-primary/50",
                                        !isCurrentMonth && "bg-muted/10 text-muted-foreground opacity-50",
                                        isToday(day) && "border-primary bg-primary/5"
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ml-auto",
                                        isToday(day) && "bg-primary text-primary-foreground"
                                    )}>
                                        {format(day, "d")}
                                    </span>

                                    <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar pointer-events-none">
                                        {items.map((item, idx) => (
                                            <div key={idx} className={cn(
                                                "h-1.5 w-full rounded-full",
                                                item.color
                                            )} />
                                        ))}
                                        {items.length > 0 && (
                                            <span className="text-[10px] leading-tight truncate px-1 font-medium text-primary">
                                                {items.length} Due
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
