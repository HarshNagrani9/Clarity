"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from "@/lib/store";

import { format } from "date-fns";

export function RadarStats() {
    const { habits, goals, tasks } = useApp();

    // Metric 1: Habit Consistency (Daily Completion Rate today)
    // Naive calc based on what we have in store for "today"
    const today = format(new Date(), 'yyyy-MM-dd');
    const dailyHabits = habits.filter(h => h.frequency === 'daily');
    const totalDaily = dailyHabits.length;
    const completedDaily = dailyHabits.filter(h => h.completedDates.includes(today)).length;
    const habitScore = totalDaily > 0 ? (completedDaily / totalDaily) * 100 : 0;

    // Metric 2: Goal Progress (Avg progress of ALL goals)
    const totalGoals = goals.length;
    const totalGoalProgress = goals.reduce((acc, g) => acc + (g.progress || 0), 0);
    const goalScore = totalGoals > 0 ? totalGoalProgress / totalGoals : 0;

    // Metric 3: Task Efficiency (High Priority Tasks Completed / Total High Priority Tasks)
    // This is tricky without history. Let's do: (1 - (Overdue / Total Active)) * 100? 
    // Or just: Mock score based on pending tasks count (fewer pending = higher score)
    // Let's inverse map pending count: 0 tasks = 100, 10+ tasks = 0.
    const pendingTasksCount = tasks.filter(t => !t.completed).length;
    const taskScore = Math.max(0, 100 - (pendingTasksCount * 10));

    // Metric 4: Focus (Goals with milestones / Total Goals)
    // More detailed goals = better focus
    const goalsWithMilestones = goals.filter(g => g.milestones && (g.milestones as any[]).length > 0).length;
    const focusScore = goals.length > 0 ? (goalsWithMilestones / goals.length) * 100 : 0;


    // Metric 6: Action Bias (Recent activity count)
    // Mocking for visual balance if needed, or use recentActivities length if we had it exposed fully here. 
    // Let's use a placeholder "85" to keep the shape nice if data is sparse.
    // Actually, let's use: (Completed Tasks / Total Tasks) * 100
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const data = [
        { subject: 'Habits', A: habitScore, fullMark: 100 },
        { subject: 'Goals', A: goalScore, fullMark: 100 },
        { subject: 'Tasks', A: taskScore, fullMark: 100 },
        { subject: 'Focus', A: focusScore, fullMark: 100 },
        { subject: 'Action', A: completionScore, fullMark: 100 },
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.5}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }}
                    itemStyle={{ color: '#a78bfa' }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
