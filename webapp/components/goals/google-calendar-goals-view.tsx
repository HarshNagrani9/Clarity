"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isAfter, compareAsc, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Goal } from "@/lib/types";

// Helper to generate a background for month headers
const getMonthPattern = (monthIndex: number) => {
    const patterns = [
        "bg-gradient-to-r from-blue-900/40 to-slate-900/40", // Jan
        "bg-gradient-to-r from-pink-900/40 to-slate-900/40", // Feb
        "bg-gradient-to-r from-green-900/40 to-slate-900/40", // Mar
        "bg-gradient-to-r from-yellow-900/40 to-slate-900/40", // Apr
        "bg-gradient-to-r from-purple-900/40 to-slate-900/40", // May
        "bg-gradient-to-r from-indigo-900/40 to-slate-900/40", // Jun
        "bg-gradient-to-r from-red-900/40 to-slate-900/40", // Jul
        "bg-gradient-to-r from-teal-900/40 to-slate-900/40", // Aug
        "bg-gradient-to-r from-orange-900/40 to-slate-900/40", // Sep
        "bg-gradient-to-r from-cyan-900/40 to-slate-900/40", // Oct
        "bg-gradient-to-r from-rose-900/40 to-slate-900/40", // Nov
        "bg-gradient-to-r from-emerald-900/40 to-slate-900/40", // Dec
    ];
    return patterns[monthIndex % 12];
};

interface GoogleCalendarGoalsViewProps {
    goals: Goal[];
}

export function GoogleCalendarGoalsView({ goals }: GoogleCalendarGoalsViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calculate calendar grid
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // --- Schedule Data Preparation ---

    // Flatten goals and milestones into a single list of events
    const scheduleItems = useMemo(() => {
        const items: { date: Date; type: 'goal' | 'milestone'; title: string; goalTitle?: string; completed: boolean; color: string }[] = [];

        goals.forEach(goal => {
            if (goal.targetDate) {
                items.push({
                    date: parseISO(goal.targetDate), // Assuming format is YYYY-MM-DD
                    type: 'goal',
                    title: goal.title,
                    completed: goal.completed,
                    color: goal.completed ? 'bg-green-500' : 'bg-blue-500' // Base goal color
                });
            }
            goal.milestones.forEach(milestone => {
                if (milestone.targetDate) {
                    items.push({
                        date: parseISO(milestone.targetDate),
                        type: 'milestone',
                        title: milestone.title,
                        goalTitle: goal.title,
                        completed: milestone.completed,
                        color: milestone.completed ? 'bg-green-500/80' : 'bg-orange-500' // Milestone color
                    });
                }
            });
        });

        // Sort by date
        return items.sort((a, b) => compareAsc(a.date, b.date));
    }, [goals]);

    // Group items by Month -> Day
    const groupedSchedule = useMemo(() => {
        const groups: Record<string, { date: Date; items: typeof scheduleItems }[]> = {}; // Key: MonthYearStr

        scheduleItems.forEach(item => {
            const monthKey = format(item.date, 'MMMM yyyy');
            const dayKey = format(item.date, 'yyyy-MM-dd');

            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }

            // Check if day entry exists
            let dayGroup = groups[monthKey].find(d => format(d.date, 'yyyy-MM-dd') === dayKey);
            if (!dayGroup) {
                dayGroup = { date: item.date, items: [] };
                groups[monthKey].push(dayGroup);
            }
            dayGroup.items.push(item);
        });

        return groups;
    }, [scheduleItems]);

    return (
        <div className="flex flex-col bg-background rounded-xl border shadow-sm">
            {/* Calendar Header / Strip */}
            <div className="bg-card border-b p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors" onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}>
                        <h2 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
                        <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
                    </div>
                </div>

                {isCalendarExpanded && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1 text-sm">
                            {days.map(day => {
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isTodayDate = isToday(day);
                                // Check if there are items on this day
                                const dayStr = format(day, 'yyyy-MM-dd');
                                const hasItems = scheduleItems.some(i => format(i.date, 'yyyy-MM-dd') === dayStr);

                                return (
                                    <div key={day.toISOString()} className={cn(
                                        "h-8 w-8 mx-auto flex items-center justify-center rounded-full cursor-pointer transition-all hover:bg-accent relative",
                                        !isCurrentMonth && "text-muted-foreground/30",
                                        isTodayDate && "bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                                    )}>
                                        {format(day, 'd')}
                                        {hasItems && !isTodayDate && (
                                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary/50" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Schedule List */}
            <div className="relative">
                {Object.keys(groupedSchedule).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-[url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay bg-background/90">
                        <p className="text-lg font-medium">No Upcoming Goals</p>
                        <p className="text-sm">Add goals to see your schedule here.</p>
                    </div>
                ) : (
                    <div className="pb-20">
                        {Object.entries(groupedSchedule).map(([month, days]) => (
                            <div key={month} className="mb-0">
                                {/* Month Header Illustration Placeholder */}
                                <div className={cn(
                                    "h-32 flex items-end p-6 relative overflow-hidden",
                                    // Use a consistent hash or just the month index to pick color
                                    getMonthPattern(new Date(month).getMonth())
                                )}>
                                    <h3 className="text-3xl font-bold text-white relative z-10 drop-shadow-md">{month}</h3>
                                    {/* Abstract Circles/Shapes for illustration vibe */}
                                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                                    <div className="absolute bottom-[-20%] left-[10%] w-24 h-24 bg-black/10 rounded-full blur-xl" />
                                </div>

                                <div className="space-y-1 p-2">
                                    {days.map((dayGroup, idx) => (
                                        <div key={idx} className="flex gap-4 py-4 px-2 hover:bg-accent/5 rounded-lg transition-colors group">
                                            {/* Date Column */}
                                            <div className="w-14 flex flex-col items-center shrink-0 pt-1">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase">{format(dayGroup.date, 'EEE')}</span>
                                                <div className={cn(
                                                    "text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full mt-0.5",
                                                    isToday(dayGroup.date) ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "text-foreground"
                                                )}>
                                                    {format(dayGroup.date, 'd')}
                                                </div>
                                            </div>

                                            {/* Items Column */}
                                            <div className="flex-1 space-y-2 min-w-0">
                                                {dayGroup.items.map((item, i) => (
                                                    <div key={i} className={cn(
                                                        "p-3 rounded-xl border text-sm flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4",
                                                        "bg-card",
                                                        item.type === 'goal' ? "border-l-blue-500" : "border-l-orange-500"
                                                    )}>
                                                        {item.type === 'goal' ? (
                                                            <div className={cn("w-2 h-2 rounded-full shrink-0", item.color)} />
                                                        ) : (
                                                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.color)} />
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn("font-semibold truncate", item.completed && "line-through text-muted-foreground")}>
                                                                {item.title}
                                                            </p>
                                                            {item.type === 'milestone' && (
                                                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                                    Goal: {item.goalTitle}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {item.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
