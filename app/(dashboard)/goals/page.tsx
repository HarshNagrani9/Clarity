"use client";


import { useState } from "react";
import { useApp } from "@/lib/store";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalCalendar } from "@/components/goals/goal-calendar";
import { GoogleCalendarGoalsView } from "@/components/goals/google-calendar-goals-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GoalsPage() {
    const { goals, addGoal, updateGoal, deleteGoal } = useApp();
    const [viewMode, setViewMode] = useState<"standard" | "schedule">("standard");

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
                    <p className="text-muted-foreground">Track your long-term objectives and milestones.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted p-1 rounded-lg border">
                        <Button
                            variant={viewMode === "standard" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("standard")}
                            className="h-8 px-2 gap-2"
                        >
                            <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Standard</span>
                        </Button>
                        <Button
                            variant={viewMode === "schedule" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("schedule")}
                            className="h-8 px-2 gap-2"
                        >
                            <CalendarDays className="w-4 h-4" /> <span className="hidden sm:inline">Schedule</span>
                        </Button>
                    </div>
                    <AddGoalDialog onAdd={addGoal} />
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 min-h-0">
                {viewMode === "standard" ? (
                    <div className="space-y-6 overflow-y-auto h-full pr-2 pb-10">
                        <GoalCalendar goals={goals} />

                        <Tabs defaultValue="active" className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList>
                                    <TabsTrigger value="active">Active Goals</TabsTrigger>
                                    <TabsTrigger value="completed">Completed</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="active" className="space-y-6 mt-0">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {activeGoals.map(goal => (
                                        <GoalCard
                                            key={goal.id}
                                            goal={goal}
                                            onUpdate={updateGoal}
                                            onDelete={deleteGoal}
                                        />
                                    ))}
                                    {activeGoals.length === 0 && (
                                        <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                            No active goals. Set a new one!
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="completed" className="space-y-6 mt-0">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {completedGoals.map(goal => (
                                        <GoalCard
                                            key={goal.id}
                                            goal={goal}
                                            onUpdate={updateGoal}
                                            onDelete={deleteGoal}
                                        />
                                    ))}
                                    {completedGoals.length === 0 && (
                                        <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                                            No completed goals yet. Keep going!
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="h-full">
                        <GoogleCalendarGoalsView goals={goals} />
                    </div>
                )}
            </div>
        </div>
    );
}

