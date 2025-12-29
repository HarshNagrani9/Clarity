"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { MobileDateStrip } from "./mobile-date-strip";
import { DailyAgenda } from "./daily-agenda";

import { useMediaQuery } from "@/hooks/use-media-query";

export function EventCalendar() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { events, addEvent, deleteEvent, habits, tasks, goals, toggleHabit, toggleTask, updateGoal } = useApp();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Initial selection: Select today if no date selected
    useEffect(() => {
        if (!selectedDate) {
            setSelectedDate(new Date());
        }
    }, []);

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
            completed: g.completed,
            milestones: g.milestones
        }));

        return { events: dayEvents, tasks: dayTasks, goals: dayGoals };
    };

    // Habits for the day (Logic from previous CalendarPage)
    const getHabitsForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return habits.filter(h => {
            if (h.startDate) {
                const startDateStr = format(new Date(h.startDate), 'yyyy-MM-dd');
                if (dateStr < startDateStr) return false;
            }
            if (h.frequency === 'daily') return true;
            if (h.frequency === 'weekly') return true; // Simplified for now
            return false;
        }).map(h => ({
            ...h,
            isCompleted: h.completedDates.includes(dateStr)
        }));
    };

    const handleAddEvent = async (formData: any) => {
        if (!selectedDate || !formData.title || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addEvent({
                title: formData.title,
                time: formData.time,
                link: formData.link,
                description: formData.description,
                date: format(selectedDate, 'yyyy-MM-dd'),
            });

            setIsAdding(false);
            setNewTitle("");
            setNewTime("");
            setNewLink("");
            setNewDescription("");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to add event:", error);
        } finally {
            setIsSubmitting(false);
        }
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

    const safeSelectedDate = selectedDate || new Date();
    const { events: selectedEvents, tasks: selectedTasks, goals: selectedGoals } = getItemsForDate(safeSelectedDate);
    const selectedHabits = getHabitsForDate(safeSelectedDate);

    const formData = { title: newTitle, time: newTime, link: newLink, description: newDescription };
    const setFormData = (data: any) => {
        if (data.title !== undefined) setNewTitle(data.title);
        if (data.time !== undefined) setNewTime(data.time);
        if (data.link !== undefined) setNewLink(data.link);
        if (data.description !== undefined) setNewDescription(data.description);
    };

    return (
        <div className="flex flex-col h-full gap-4 relative">
            {/* Improved Mobile Toast */}
            {showSuccess && (
                <div className="fixed top-6 left-4 right-4 z-[100] flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-white px-4 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-500">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Success</span>
                        <span className="text-xs text-zinc-400">Event has been added to your calendar.</span>
                    </div>
                </div>
            )}

            {/* ... */}


            {/* Mobile View: Horizontal Date Strip */}
            <div className="md:hidden">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
                        <CardTitle className="text-lg font-bold">
                            {format(currentMonth, "MMMM yyyy")}
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0">
                        <MobileDateStrip
                            days={days}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            getItemsForDate={getItemsForDate}
                        />
                    </CardContent>
                </Card>

                {/* Mobile Agenda (Always visible below strip) */}
                <div className="mt-4">
                    <DailyAgenda
                        date={safeSelectedDate}
                        events={selectedEvents}
                        habits={selectedHabits}
                        tasks={selectedTasks}
                        goals={selectedGoals}
                        isAdding={isAdding}
                        setIsAdding={setIsAdding}
                        onAddEvent={handleAddEvent}
                        onDeleteEvent={handleDeleteEvent}
                        formData={formData}
                        setFormData={setFormData}
                        onToggleHabit={(id) => toggleHabit(id, format(safeSelectedDate, 'yyyy-MM-dd'))}
                        onToggleTask={toggleTask}
                        onUpdateGoal={updateGoal}
                    />
                </div>
            </div>

            {/* Desktop View: Month Grid (Hidden on Mobile) */}
            <div className="hidden md:block h-full">
                <Dialog open={!!selectedDate && isDesktop} onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDate(null);
                        resetForm();
                    }
                }}>
                    <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedDate && format(selectedDate, "EEEE, MMMM do, yyyy")}
                            </DialogTitle>
                            <DialogDescription>
                                Agenda for the day
                            </DialogDescription>
                        </DialogHeader>
                        <DailyAgenda
                            date={safeSelectedDate}
                            events={selectedEvents}
                            habits={selectedHabits}
                            tasks={selectedTasks}
                            goals={selectedGoals}
                            isAdding={isAdding}
                            setIsAdding={setIsAdding}
                            onAddEvent={handleAddEvent}
                            onDeleteEvent={handleDeleteEvent}
                            formData={formData}
                            setFormData={setFormData}
                            onToggleHabit={(id) => toggleHabit(id, format(safeSelectedDate, 'yyyy-MM-dd'))}
                            onToggleTask={toggleTask}
                            onUpdateGoal={updateGoal}
                        />
                    </DialogContent>
                </Dialog>

                <Card className="h-full border-none shadow-none flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 shrink-0">
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
                    <CardContent className="px-4 flex-1 overflow-y-auto min-h-0">
                        <div className="grid grid-cols-7 gap-4 mb-4 text-center text-sm font-medium text-muted-foreground">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-4 auto-rows-fr">
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
                                            "p-3 border rounded-xl relative flex flex-col gap-1 overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer bg-card/50 hover:bg-card min-h-[120px]",
                                            isToday(day) && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={cn(
                                                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors shrink-0",
                                                isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                            )}>
                                                {format(day, "d")}
                                            </span>
                                            {itemCount > 0 && (
                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                    {itemCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1.5 overflow-hidden mt-2">
                                            {dayEvents.slice(0, 2).map((event) => (
                                                <div key={event.id} className="text-[10px] truncate px-2 py-1 rounded bg-secondary/80 text-secondary-foreground font-medium flex items-center gap-1.5 border border-transparent hover:border-border/50 transition-colors">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                    <span className="truncate">{event.title}</span>
                                                </div>
                                            ))}
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
            </div>
        </div>
    );
}
