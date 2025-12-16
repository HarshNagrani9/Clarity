"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useApp } from "@/lib/store";
import { format } from "date-fns";

export function OverviewChart() {
    const { habits, tasks, goals } = useApp();

    const getLast7Days = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    const last7Days = getLast7Days();
    const data = last7Days.map(date => {
        // Habits completed on this date
        const habitsCount = habits.reduce((acc, habit) => {
            return acc + (habit.completedDates.includes(date) ? 1 : 0);
        }, 0);

        // Tasks completed (using completedAt if available, else naive check if completed and no date ?)
        // Since we don't have 'completedAt' populated in the FE logic usually, we might need to rely on the fact 
        // that tasks just have 'completed' boolean. 
        // *Correction*: To show meaningful progress over time, we need timestamps. 
        // Since the current `tasks` store only has `completed` boolean without `completedAt` being actively used/synced in FE state properly in previous steps (only schema has it), 
        // we will fall back to using `daily` completion for Habits, and maybe just show "Due Tasks" or similar?
        // Actually, the user wants "Progress of all three". 
        // For now, let's count tasks *due* on that day that are completed? Or just stick to Habits as the primary metric if dates aren't reliable?
        // Let's assume we want to show ACTIVITY.
        // We'll trust the habit dates. For Tasks/Goals, if we don't have completion dates, we can't plot them historically accurately.
        // We will assume 'Habits' is the main daily activity tracker. 
        // BUT the user explicitly asked for "progress of all three". 
        // Let's try to infer from data: Tasks due on `date` that are `completed`.
        const tasksCount = tasks.filter(t => t.dueDate && t.dueDate.startsWith(date) && t.completed).length;

        // Goals don't really have "daily completion" unless they have milestones. 
        // Let's count Goals *targeted* for this date that are completed?
        const goalsCount = goals.filter(g => g.targetDate && g.targetDate.startsWith(date) && g.completed).length;

        const dayName = format(new Date(date), "EEE");
        return {
            name: dayName,
            Habits: habitsCount,
            Tasks: tasksCount,
            Goals: goalsCount
        };
    });

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
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
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--background)' }}
                />
                <Legend />
                <Bar dataKey="Habits" stackId="a" fill="var(--chart-1)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Tasks" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Goals" stackId="a" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
