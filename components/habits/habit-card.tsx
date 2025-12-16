"use client";

import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitCardProps {
    habit: Habit;
    onToggle: (id: number) => void;
    onDelete?: (id: number) => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates.includes(today);

    return (
        <Card className="hover:bg-accent/5 transition-colors group relative">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Button
                        size="icon"
                        variant="outline"
                        className={cn(
                            "h-10 w-10 rounded-full border-2 transition-all duration-300",
                            isCompletedToday
                                ? "bg-primary border-primary text-primary-foreground"
                                : "hover:bg-primary/10 hover:border-primary/50 text-muted-foreground"
                        )}
                        onClick={() => onToggle(habit.id)}
                        style={{
                            borderColor: isCompletedToday ? habit.color : undefined,
                            backgroundColor: isCompletedToday ? habit.color : undefined
                        }}
                    >
                        <Check className={cn("h-5 w-5", isCompletedToday ? "opacity-100" : "opacity-0")} />
                    </Button>
                    <div>
                        <h3 className="font-semibold">{habit.title}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{habit.frequency} • {habit.streak} day streak</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Simple visual progress - to be replaced with sparkline later */}
                    <div className="hidden sm:flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn("w-2 h-6 rounded-sm bg-secondary", i < 3 ? "bg-primary/50" : "")}
                                style={{ backgroundColor: i < 3 ? habit.color : undefined, opacity: 0.3 + (i * 0.1) }}></div>
                        ))}
                    </div>
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(habit.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
