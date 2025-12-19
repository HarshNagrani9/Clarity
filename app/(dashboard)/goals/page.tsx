"use client";


import { useApp } from "@/lib/store";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalCalendar } from "@/components/goals/goal-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GoalsPage() {
    const { goals, addGoal, updateGoal, deleteGoal } = useApp();

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
                    <p className="text-muted-foreground">Track your long-term objectives and milestones.</p>
                </div>
                <AddGoalDialog onAdd={addGoal} />
            </div>

            <Tabs defaultValue="active" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="active">Active Goals</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="active" className="space-y-6">
                    <GoalCalendar goals={activeGoals} />

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

                <TabsContent value="completed">
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
    );
}

