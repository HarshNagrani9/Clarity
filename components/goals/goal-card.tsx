import { useState } from "react";
import { Check, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GoalDetailDialog } from "./goal-detail-dialog";

interface GoalCardProps {
    goal: Goal;
    onUpdate: (id: number, updates: Partial<Goal>) => void;
    onDelete: (id: number) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
    const [detailOpen, setDetailOpen] = useState(false);

    const handleMilestoneToggle = (index: number) => {
        const newMilestones = [...goal.milestones];
        newMilestones[index].completed = !newMilestones[index].completed;

        // Recalculate progress
        const completedCount = newMilestones.filter(m => m.completed).length;
        const progress = Math.round((completedCount / newMilestones.length) * 100);

        onUpdate(goal.id, {
            milestones: newMilestones,
            progress,
            completed: progress === 100
        });
    };

    return (
        <>
            <GoalDetailDialog
                goal={goal}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUpdate={onUpdate}
            />
            <Card className="hover:bg-accent/5 transition-colors group">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            {goal.targetDate && (
                                <CardDescription>Target: {format(new Date(goal.targetDate), "P")}</CardDescription>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={goal.completed ? "default" : "outline"} className={goal.completed ? "bg-green-500 hover:bg-green-600" : ""}>
                                {goal.completed ? "Completed" : "In Progress"}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setDetailOpen(true)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(goal.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                    </div>

                    {goal.milestones.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <p className="text-xs font-medium text-muted-foreground">Milestones</p>
                            <div className="space-y-2">
                                {goal.milestones.map((milestone, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`milestone-${goal.id}-${idx}`}
                                            checked={milestone.completed}
                                            onCheckedChange={() => handleMilestoneToggle(idx)}
                                        />
                                        <label
                                            htmlFor={`milestone-${goal.id}-${idx}`}
                                            className={cn(
                                                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                                milestone.completed && "line-through text-muted-foreground"
                                            )}
                                        >
                                            {milestone.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
