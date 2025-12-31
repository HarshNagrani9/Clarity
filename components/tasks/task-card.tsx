"use client";

import { Trash2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isBefore, startOfDay } from "date-fns";

interface TaskCardProps {
    task: Task;
    onToggle: (id: number) => void;
    onUpdate: (id: number, updates: Partial<Task>) => void;
    onDelete: (id: number) => void;
}

const priorityColor = {
    low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export function TaskCard({ task, onToggle, onUpdate, onDelete }: TaskCardProps) {
    const isOverdue = task.dueDate &&
        isBefore(new Date(task.dueDate), startOfDay(new Date())) &&
        !task.completed;

    const handleDateUpdate = (dateString: string) => {
        if (!dateString) return;
        const newDate = new Date(dateString).toISOString();
        onUpdate(task.id, { dueDate: newDate });
    };

    const handleProgressChange = (values: number[]) => {
        onUpdate(task.id, { progress: values[0] });
    };

    return (
        <Card
            className={cn(
                "transition-all hover:bg-accent/5",
                task.completed && "opacity-60",
                isOverdue && "border-destructive/50 bg-destructive/5 hover:bg-destructive/10"
            )}
        >
            <CardContent className="flex items-center p-4 gap-4">
                <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggle(task.id)}
                    className="h-5 w-5 mt-1 self-start"
                />
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                                {task.title}
                            </span>
                            <Badge variant="secondary" className={cn("capitalize text-xs font-normal border-0", priorityColor[task.priority])}>
                                {task.priority}
                            </Badge>
                            {isOverdue && (
                                <Badge variant="destructive" className="flex items-center gap-1 text-[10px] px-1.5 h-5">
                                    <AlertCircle className="h-3 w-3" />
                                    Missed Deadline
                                </Badge>
                            )}
                        </div>

                        {!task.completed && (
                            <div className="flex items-center gap-3 w-full max-w-xs">
                                <span className="text-[10px] text-muted-foreground w-8 tabular-nums">{task.progress}%</span>
                                <Slider
                                    defaultValue={[task.progress]}
                                    max={100}
                                    step={10}
                                    className="flex-1"
                                    onValueCommit={handleProgressChange}
                                />
                            </div>
                        )}
                    </div>

                    {task.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-auto p-0 hover:bg-transparent font-normal",
                                            isOverdue ? "text-destructive hover:text-destructive" : "hover:text-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="h-3 w-3 mr-1" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-3" align="start">
                                    <div className="grid gap-2">
                                        <div className="text-sm font-medium leading-none">Reset Deadline</div>
                                        <Input
                                            type="date"
                                            defaultValue={new Date(task.dueDate).toISOString().split('T')[0]}
                                            onChange={(e) => handleDateUpdate(e.target.value)}
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive self-start" onClick={() => onDelete(task.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}
