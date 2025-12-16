"use client";


import { useApp } from "@/lib/store";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { GoalCard } from "@/components/goals/goal-card";

export default function GoalsPage() {
    const { goals, addGoal, updateGoal, deleteGoal } = useApp();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
                    <p className="text-muted-foreground">Track your long-term objectives and milestones.</p>
                </div>
                <AddGoalDialog onAdd={addGoal} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {goals.map(goal => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdate={updateGoal}
                        onDelete={deleteGoal}
                    />
                ))}
            </div>
        </div>
    );
}

