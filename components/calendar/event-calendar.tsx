"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2, Link as LinkIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

export function EventCalendar() {
    const { events, addEvent, deleteEvent, habits, tasks, goals } = useApp();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newTime, setNewTime] = useState("");
    const [newLink, setNewLink] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getItemsForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        // Events
        const dayEvents = events.filter(e => e.date === dateStr).map(e => ({ ...e, type: 'event' as const }));

        // Tasks (Due Date)
        const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr)).map(t => ({
            id: t.id,
            title: t.title,
            type: 'task' as const,
            completed: t.completed,
            priority: t.priority
        }));

        // Goals (Target Date)
        const dayGoals = goals.filter(g => g.targetDate && g.targetDate.startsWith(dateStr)).map(g => ({
            id: g.id,
            title: g.title,
            type: 'goal' as const,
            completed: g.completed
        }));

        return { events: dayEvents, tasks: dayTasks, goals: dayGoals };
    };

    // Habits for the day (Logic from previous CalendarPage)
    const getHabitsForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return habits.filter(h => {
            if (h.frequency === 'daily') return true;
            if (h.frequency === 'weekly') return true; // Simplified for now
            return false;
        }).map(h => ({
            ...h,
            isCompleted: h.completedDates.includes(dateStr)
        }));
    };

    const handleAddEvent = async () => {
        if (!selectedDate || !newTitle) return;

        await addEvent({
            title: newTitle,
            time: newTime,
            link: newLink,
            description: newDescription,
            date: format(selectedDate, 'yyyy-MM-dd'),
        });

        setIsAdding(false);
        resetForm();
    };

    const handleDeleteEvent = async (id: number) => {
        await deleteEvent(id);
    };

    const resetForm = () => {
        setNewTitle("");
        setNewTime("");
        setNewLink("");
        setNewDescription("");
        setIsAdding(false);
    };

    const { events: selectedEvents, tasks: selectedTasks, goals: selectedGoals } = selectedDate ? getItemsForDate(selectedDate) : { events: [], tasks: [], goals: [] };
    const selectedHabits = selectedDate ? getHabitsForDate(selectedDate) : [];

    return (
        <>
            <Dialog open={!!selectedDate} onOpenChange={(open) => {
                if (!open) {
                    setSelectedDate(null);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDate && format(selectedDate, "EEEE, MMMM do, yyyy")}
                        </DialogTitle>
                        <DialogDescription>
                            Agenda for the day
                        </DialogDescription>
                    </DialogHeader>

                    {!isAdding ? (
                        <div className="space-y-6">
                            {/* Events Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">Events</h4>
                                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setIsAdding(true)}>
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                                </div>
                                {selectedEvents.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No events.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedEvents.map(event => (
                                            <div key={event.id} className="p-3 rounded-lg border bg-card relative group flex gap-3">
                                                {/* Time Column */}
                                                <div className="flex flex-col items-center justify-center min-w-[60px] border-r pr-3 text-muted-foreground">
                                                    {event.time ? (
                                                        <>
                                                            <span className="text-sm font-semibold text-foreground">{event.time}</span>
                                                            {/* Optional: Add AM/PM logic if needed, or rely on user input */}
                                                        </>
                                                    ) : (
                                                        <span className="text-xs italic">All Day</span>
                                                    )}
                                                </div>

                                                {/* Content Column */}
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-sm leading-none">{event.title}</span>
                                                        <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1" onClick={() => handleDeleteEvent(event.id)}>
                                                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                                                        </Button>
                                                    </div>

                                                    {event.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                                                    )}

                                                    {event.link && (
                                                        <a
                                                            href={event.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-fit pt-1"
                                                        >
                                                            <LinkIcon className="w-3 h-3" />
                                                            {new URL(event.link).hostname.replace('www.', '')}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Habits Section */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Habits</h4>
                                {selectedHabits.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No habits for today.</p>
                                ) : (
                                    <div className="space-y-1">
                                        {selectedHabits.map(habit => (
                                            <div key={habit.id} className="flex items-center gap-2 text-sm p-2 rounded-md border bg-muted/20">
                                                <div className={cn("w-2 h-2 rounded-full", habit.isCompleted ? "bg-green-500" : "bg-gray-300")} />
                                                <span className={cn(habit.isCompleted && "line-through text-muted-foreground")}>{habit.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tasks Section */}
                            {selectedTasks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
                                        Tasks
                                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-1.5 rounded-full">{selectedTasks.length}</span>
                                    </h4>
                                    <div className="space-y-1">
                                        {selectedTasks.map(task => (
                                            <div key={`t-${task.id}`} className="flex items-center gap-3 text-sm p-3 rounded-md border bg-card/50">
                                                <div className={cn("w-2 h-2 rounded-full shrink-0", task.completed ? "bg-muted-foreground" : getPriorityColor(task.priority))} />
                                                <span className={cn("flex-1", task.completed && "line-through text-muted-foreground")}>{task.title}</span>
                                                {task.priority !== 'medium' && (
                                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded capitalize",
                                                        task.priority === 'high' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {task.priority}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Goals Section */}
                            {selectedGoals.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 text-purple-600">
                                        Goals & Milestones
                                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-1.5 rounded-full">{selectedGoals.length}</span>
                                    </h4>
                                    <div className="space-y-1">
                                        {selectedGoals.map(goal => (
                                            <div key={`g-${goal.id}`} className="flex items-center gap-3 text-sm p-3 rounded-md border bg-card/50">
                                                <div className={cn("w-2 h-2 rounded-full shrink-0", goal.completed ? "bg-green-500" : "bg-purple-500")} />
                                                <span className={cn("flex-1", goal.completed && "line-through text-muted-foreground")}>{goal.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Event Title</Label>
                                <Input
                                    placeholder="Dinner with friends"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link</Label>
                                    <Input
                                        type="url"
                                        placeholder="https://..."
                                        value={newLink}
                                        onChange={(e) => setNewLink(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Notes..."
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button onClick={handleAddEvent} disabled={!newTitle}>Save Event</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Card className="h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0">
                    <CardTitle className="text-2xl font-bold">
                        {format(currentMonth, "MMMM yyyy")}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-7 gap-1 md:gap-4 mb-4 text-center text-xs md:text-sm font-medium text-muted-foreground">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-4 auto-rows-fr">
                        {days.map((day) => {
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            if (!isCurrentMonth) {
                                return <div key={day.toString()} className="invisible" />;
                            }

                            const { events: dayEvents, tasks: dayTasks, goals: dayGoals } = getItemsForDate(day);
                            const itemCount = dayEvents.length + dayTasks.length + dayGoals.length;

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "p-1 md:p-3 border rounded-lg md:rounded-xl relative flex flex-col gap-1 overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer bg-card/50 hover:bg-card aspect-square md:aspect-auto md:min-h-[120px]",
                                        isToday(day) && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                    )}
                                >
                                    <div className="flex justify-center md:justify-between items-center md:items-start h-full md:h-auto">
                                        <span className={cn(
                                            "text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-colors shrink-0",
                                            isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                        )}>
                                            {format(day, "d")}
                                        </span>
                                        {itemCount > 0 && (
                                            <span className="hidden md:inline-flex text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                {itemCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile: Dot Indicators */}
                                    <div className="flex md:hidden justify-center gap-0.5 absolute bottom-1.5 left-0 right-0 px-1">
                                        {dayEvents.length > 0 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        )}
                                        {dayTasks.length > 0 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        )}
                                        {dayGoals.length > 0 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        )}
                                    </div>

                                    {/* Desktop: Details List */}
                                    <div className="hidden md:flex flex-col gap-1.5 overflow-hidden mt-2">
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <div key={event.id} className="text-[10px] truncate px-2 py-1 rounded bg-secondary/80 text-secondary-foreground font-medium flex items-center gap-1.5 border border-transparent hover:border-border/50 transition-colors">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                <span className="truncate">{event.title}</span>
                                            </div>
                                        ))}
                                        {/* Show task indicator if space permits or if no events */}
                                        {dayEvents.length < 2 && dayTasks.length > 0 && (
                                            <div className="text-[10px] truncate px-2 py-1 rounded bg-orange-500/10 text-orange-600 font-medium flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                                <span className="truncate">{dayTasks.length} Task{dayTasks.length > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                        {dayEvents.length === 0 && dayTasks.length === 0 && dayGoals.length > 0 && (
                                            <div className="text-[10px] truncate px-2 py-1 rounded bg-purple-500/10 text-purple-600 font-medium flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                                <span className="truncate">{dayGoals.length} Goal{dayGoals.length > 1 ? 's' : ''}</span>
                                            </div>
                                        )}

                                        {(itemCount > 2) && (dayEvents.length >= 2 || (dayEvents.length + (dayTasks.length > 0 ? 1 : 0) + (dayGoals.length > 0 ? 1 : 0) > 2)) && (
                                            <span className="text-[10px] text-muted-foreground pl-1">
                                                +{itemCount - 2} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
