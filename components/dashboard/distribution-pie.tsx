"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useApp } from "@/lib/store";

export function DistributionPie() {
    const { habits, goals, tasks } = useApp();

    const data = [
        { name: 'Habits', value: habits.length },
        { name: 'Goals', value: goals.length },
        { name: 'Tasks', value: tasks.length },
    ];

    // Vibrant/Neon Palette to match theme
    const COLORS = ['#10b981', '#f59e0b', '#3b82f6']; // Emerald, Amber, Blue

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    );
}
