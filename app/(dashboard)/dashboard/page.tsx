"use client";

import { useApp } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Target, ListTodo, TrendingUp, Activity, PieChart as PieIcon, Radar as RadarIcon } from "lucide-react";
import { RadarStats } from "@/components/dashboard/radar-stats";
import { DistributionPie } from "@/components/dashboard/distribution-pie";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const { habits, goals, tasks, recentActivities } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Logic Fix: Only count DAILY habits for the daily percentage
  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  const totalDailyHabits = dailyHabits.length;

  const dailyHabitsCompletedToday = dailyHabits.filter(h =>
    h.completedDates.includes(todayStr)
  ).length;

  // Percentage can never exceed 100%
  const habitPercentage = totalDailyHabits > 0
    ? Math.min(100, Math.round((dailyHabitsCompletedToday / totalDailyHabits) * 100))
    : 0;

  const activeGoals = goals.filter(g => !g.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high').length;

  const maxStreak = Math.max(0, ...habits.map(h => h.streak));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your overview for today.</p>
        </div>
        <Link href="/calendar">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" /> View Calendar
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Habits
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habitPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {dailyHabitsCompletedToday} / {totalDailyHabits} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Goals
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              Keep pushing!
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {highPriorityTasks} high priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Streak
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxStreak} Days</div>
            <p className="text-xs text-muted-foreground">
              Consistency is key
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Charts & Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Radar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance</CardTitle>
              <RadarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Metric comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <RadarStats />
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Focus Distribution</CardTitle>
              <PieIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Active items breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionPie />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {/* Recent Activity */}
        <ActivityFeed activities={recentActivities} />
      </div>
    </div>
  );
}
