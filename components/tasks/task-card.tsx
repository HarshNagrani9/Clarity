"use client";

import { Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

const priorityColor = {
    low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
    return (
        <Card className={cn("transition-all hover:bg-accent/5", task.completed && "opacity-60")}>
            <CardContent className="flex items-center p-4 gap-4">
                <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggle(task.id)}
                    className="h-5 w-5"
                />
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                            {task.title}
                        </span>
                        <Badge variant="secondary" className={cn("capitalize text-xs font-normal border-0", priorityColor[task.priority])}>
                            {task.priority}
                        </Badge>
                    </div>
                    {task.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(task.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}
