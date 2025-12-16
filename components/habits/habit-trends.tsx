"use client";

import { Habit } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { subDays, format } from "date-fns";

interface HabitTrendsProps {
    habits: Habit[];
}

export function HabitTrends({ habits }: HabitTrendsProps) {
    // Generate last 14 days data
    const data = Array.from({ length: 14 }).map((_, i) => {
        const date = subDays(new Date(), 13 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'MMM dd');

        let dailyCompleted = 0;
        let weeklyCompleted = 0;

        habits.forEach(h => {
            if (h.completedDates.includes(dateStr)) {
                if (h.frequency === 'weekly') weeklyCompleted++;
                else dailyCompleted++; // Group daily and custom as 'daily' type activity
            }
        });

        return {
            name: displayDate,
            daily: dailyCompleted,
            weekly: weeklyCompleted,
            total: dailyCompleted + weeklyCompleted
        };
    });

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Completion Trends</CardTitle>
                <CardDescription>
                    Your habit consistency over the last 14 days.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                            labelStyle={{ color: 'var(--foreground)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="daily"
                            name="Daily Habits"
                            stroke="#22c55e"
                            fillOpacity={1}
                            fill="url(#colorDaily)"
                            stackId="1"
                        />
                        <Area
                            type="monotone"
                            dataKey="weekly"
                            name="Weekly Habits"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorWeekly)"
                            stackId="1"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
