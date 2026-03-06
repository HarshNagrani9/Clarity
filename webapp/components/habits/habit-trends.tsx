"use client";

import { Habit } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { subDays, format, startOfWeek, endOfWeek, subWeeks, isWithinInterval, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HabitTrendsProps {
    habits: Habit[];
}

export function HabitTrends({ habits }: HabitTrendsProps) {
    // 1. Daily Data (Last 14 Days) - Only for 'daily' habits
    const dailyHabits = habits.filter(h => h.frequency === 'daily' || h.frequency === 'custom'); // Treat custom as daily for now

    const dailyData = Array.from({ length: 14 }).map((_, i) => {
        const date = subDays(new Date(), 13 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'MMM dd');

        let completedCount = 0;
        dailyHabits.forEach(h => {
            if (h.completedDates.includes(dateStr)) {
                completedCount++;
            }
        });

        return {
            name: displayDate,
            completed: completedCount,
        };
    });

    // 2. Weekly Data (Last 4 Weeks) - Only for 'weekly' habits
    const weeklyHabits = habits.filter(h => h.frequency === 'weekly');

    const weeklyData = Array.from({ length: 4 }).map((_, i) => {
        // 0 = Current Week, 1 = Last Week ...
        // We want reverse chronological order for calculation, but chronological for display?
        // Let's do chronological: 3 weeks ago -> Current Week.
        const weeksAgo = 3 - i;
        const dateInWeek = subWeeks(new Date(), weeksAgo);
        const weekStart = startOfWeek(dateInWeek, { weekStartsOn: 1 }); // Monday start
        const weekEnd = endOfWeek(dateInWeek, { weekStartsOn: 1 });

        const displayLabel = i === 3 ? "This Week" : format(weekStart, 'MMM d');

        let completedCount = 0;

        weeklyHabits.forEach(h => {
            // Check if ANY completion fell within this week window
            const hasCompletion = h.completedDates.some(dateStr => {
                const date = parseISO(dateStr);
                return isWithinInterval(date, { start: weekStart, end: weekEnd });
            });
            if (hasCompletion) completedCount++;
        });

        // Optional: Calculate percentage based on total weekly habits? 
        // Or just raw count. Raw count is safer.

        return {
            name: displayLabel,
            completed: completedCount,
            total: weeklyHabits.length
        };
    });

    return (
        <Card className="col-span-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Completion Trends</CardTitle>
                        <CardDescription>
                            Visualize your consistency.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="daily" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="daily">Daily Momentum</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily" className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    labelStyle={{ color: 'var(--foreground)' }}
                                />
                                <Area type="monotone" dataKey="completed" name="Habits Done" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDaily)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="weekly" className="h-[250px]">
                        {weeklyHabits.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                No weekly habits tracked yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        labelStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="completed" name="Habits Met" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
