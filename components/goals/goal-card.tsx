import { useState } from "react";
import { Check, MoreHorizontal, Trash2, Eye, AlertCircle, CalendarClock } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GoalDetailDialog } from "./goal-detail-dialog";
import { MilestoneDetailDialog } from "./milestone-detail-dialog";

interface GoalCardProps {
    goal: Goal;
    onUpdate: (id: number, updates: Partial<Goal>) => void;
    onDelete: (id: number) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number | null>(null);

    const isGoalOverdue = goal.targetDate &&
        isBefore(new Date(goal.targetDate), startOfDay(new Date())) &&
        !goal.completed;

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

    const handleGoalDateUpdate = (dateString: string) => {
        if (!dateString) return;
        onUpdate(goal.id, { targetDate: new Date(dateString).toISOString() });
    };

    const handleMilestoneDateUpdate = (index: number, dateString: string) => {
        if (!dateString) return;
        const newMilestones = [...goal.milestones];
        newMilestones[index].targetDate = new Date(dateString).toISOString();
        onUpdate(goal.id, { milestones: newMilestones });
    };

    return (
        <>
            <GoalDetailDialog
                goal={goal}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUpdate={onUpdate}
            />
            {selectedMilestoneIdx !== null && (
                <MilestoneDetailDialog
                    goal={goal}
                    milestoneIndex={selectedMilestoneIdx}
                    open={selectedMilestoneIdx !== null}
                    onOpenChange={(open) => !open && setSelectedMilestoneIdx(null)}
                    onUpdate={onUpdate}
                />
            )}

            <Card className={cn(
                "hover:bg-accent/5 transition-colors group relative",
                isGoalOverdue && "border-destructive/50 bg-destructive/5 hover:bg-destructive/10"
            )}>
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div
                            className="cursor-pointer"
                            onClick={() => setDetailOpen(true)}
                        >
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg hover:underline decoration-dotted underline-offset-4">{goal.title}</CardTitle>
                                {isGoalOverdue && (
                                    <Badge variant="destructive" className="flex items-center gap-1 text-[10px] px-1.5 h-5">
                                        <AlertCircle className="h-3 w-3" />
                                        Missed
                                    </Badge>
                                )}
                            </div>
                            {goal.targetDate && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div
                                                className={cn(
                                                    "text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors",
                                                    isGoalOverdue && "text-destructive font-medium hover:text-destructive"
                                                )}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span>Target: {format(new Date(goal.targetDate), "P")}</span>
                                                {isGoalOverdue && <CalendarClock className="h-3 w-3" />}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-3" align="start" onClick={(e) => e.stopPropagation()}>
                                            <div className="grid gap-2">
                                                <div className="text-sm font-medium leading-none">Reset Deadline</div>
                                                <Input
                                                    type="date"
                                                    defaultValue={new Date(goal.targetDate).toISOString().split('T')[0]}
                                                    onChange={(e) => handleGoalDateUpdate(e.target.value)}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={goal.completed ? "default" : "outline"} className={goal.completed ? "bg-green-500 hover:bg-green-600" : ""}>
                                {goal.completed ? "Completed" : "In Progress"}
                            </Badge>
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
                        <Progress value={goal.progress} className={cn("h-2", isGoalOverdue && "bg-destructive/20 [&>div]:bg-destructive")} />
                    </div>

                    {goal.milestones.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <p className="text-xs font-medium text-muted-foreground">Milestones</p>
                            <div className="space-y-2">
                                {goal.milestones.map((milestone, idx) => {
                                    const isMilestoneOverdue = milestone.targetDate &&
                                        isBefore(new Date(milestone.targetDate), startOfDay(new Date())) &&
                                        !milestone.completed;

                                    return (
                                        <div key={idx} className={cn(
                                            "flex items-center space-x-2 group/milestone rounded-md p-1 -mx-1",
                                            isMilestoneOverdue && "bg-destructive/10"
                                        )}>
                                            <Checkbox
                                                id={`milestone-${goal.id}-${idx}`}
                                                checked={milestone.completed}
                                                onCheckedChange={() => handleMilestoneToggle(idx)}
                                            />
                                            <div
                                                className="flex-1 flex items-center justify-between cursor-pointer hover:bg-accent/50 p-1.5 rounded-md transition-colors"
                                            >
                                                <div
                                                    className="flex-1"
                                                    onClick={() => setSelectedMilestoneIdx(idx)}
                                                >
                                                    <label
                                                        className={cn(
                                                            "text-sm font-medium leading-none cursor-pointer",
                                                            milestone.completed && "line-through text-muted-foreground",
                                                            isMilestoneOverdue && !milestone.completed && "text-destructive"
                                                        )}
                                                    >
                                                        {milestone.title}
                                                    </label>
                                                    {(milestone.notes || milestone.resources?.length) && (
                                                        <span className="ml-2 text-[10px] text-primary/70">
                                                            • Details
                                                        </span>
                                                    )}
                                                </div>

                                                {milestone.targetDate && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <div
                                                                className={cn(
                                                                    "ml-2 text-[10px] text-muted-foreground border px-1 rounded bg-secondary/30 hover:bg-secondary/50 cursor-pointer",
                                                                    isMilestoneOverdue && "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                                )}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {format(new Date(milestone.targetDate), "MMM d")}
                                                                {isMilestoneOverdue && " ⚠️"}
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-3" align="end" onClick={(e) => e.stopPropagation()}>
                                                            <div className="grid gap-2">
                                                                <div className="text-sm font-medium leading-none">Reset Milestone</div>
                                                                <Input
                                                                    type="date"
                                                                    defaultValue={new Date(milestone.targetDate).toISOString().split('T')[0]}
                                                                    onChange={(e) => handleMilestoneDateUpdate(idx, e.target.value)}
                                                                />
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}

                                                <Eye
                                                    className="h-3 w-3 text-muted-foreground opacity-0 group-hover/milestone:opacity-100 transition-opacity ml-2"
                                                    onClick={() => setSelectedMilestoneIdx(idx)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
