"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Habit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Check, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { HabitHeatmap } from "./habit-heatmap";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface HabitCardProps {
    habit: Habit;
    selectedDate?: string;
    onDelete: (id: number) => void;
}

export function HabitCard({ habit, selectedDate, onDelete }: HabitCardProps) {
    const { toggleHabit } = useApp();
    const today = format(new Date(), 'yyyy-MM-dd');
    const activeDate = selectedDate || today;
    const isCompletedOnDate = habit.completedDates.includes(activeDate);
    const [isOpen, setIsOpen] = useState(false);

    const isToday = activeDate === today;

    return (
        <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{habit.title}</CardTitle>
                <div className="flex items-center gap-2">
                    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <CalendarDays className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                    <div className="flex items-center text-orange-500">
                        <Flame className="h-4 w-4 mr-1 fill-orange-500" />
                        <span className="font-bold text-sm">{habit.streak}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {habit.description && <p className="text-sm text-muted-foreground mb-4">{habit.description}</p>}

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleContent className="mb-4 animate-in slide-in-from-top-2">
                        <HabitHeatmap habit={habit} onToggleDate={(date) => toggleHabit(habit.id, date)} />
                    </CollapsibleContent>
                </Collapsible>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-1 items-center">
                        <Button
                            size="sm"
                            variant={isCompletedOnDate ? "default" : "outline"}
                            className={cn(
                                "transition-all duration-300 mr-2",
                                isCompletedOnDate && "bg-green-500 hover:bg-green-600 text-white border-green-500",
                                !isToday && "opacity-50 cursor-not-allowed"
                            )}
                            style={isCompletedOnDate ? { backgroundColor: habit.color, borderColor: habit.color } : {}}
                            onClick={() => isToday && toggleHabit(habit.id, activeDate)}
                            disabled={!isToday}
                        >
                            {isCompletedOnDate ? <Check className="h-4 w-4 mr-1" /> : null}
                            {isCompletedOnDate ? "Done" : (isToday ? "Check In" : "Not Done")}
                        </Button>

                        {/* Short Badge for frequency */}
                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-muted text-muted-foreground">
                            {habit.frequency}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(habit.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
