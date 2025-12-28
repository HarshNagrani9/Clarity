import { Trash2, Link as LinkIcon, Plus } from "lucide-react";
import { isBefore, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DailyAgendaProps {
    date: Date;
    events: any[];
    habits: any[];
    tasks: any[];
    goals: any[];
    isAdding: boolean;
    setIsAdding: (val: boolean) => void;
    onAddEvent: (data: any) => Promise<void>;
    onDeleteEvent: (id: number) => Promise<void>;
    formData: {
        title: string;
        time: string;
        link: string;
        description: string;
    };
    isSubmitting?: boolean;
    setFormData: (data: any) => void;
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

export function DailyAgenda({
    date,
    events,
    habits,
    tasks,
    goals,
    isAdding,
    setIsAdding,
    onAddEvent,
    onDeleteEvent,
    formData,
    setFormData,
    isSubmitting = false,
}: DailyAgendaProps) {

    const handleSave = () => {
        onAddEvent(formData);
    };

    if (isAdding) {
        return (
            <div className="space-y-4 p-4 border rounded-lg bg-card/50">
                <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input
                        placeholder="Dinner with friends"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Link</Label>
                        <Input
                            type="url"
                            placeholder="https://..."
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        placeholder="Notes..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" onClick={() => setIsAdding(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!formData.title || isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Event"}
                    </Button>
                </div>
            </div>
        );
    }

    const hasItems = events.length > 0 || habits.length > 0 || tasks.length > 0 || goals.length > 0;

    if (!hasItems) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 border rounded-lg border-dashed">
                <p className="text-muted-foreground">No plans for today.</p>
                <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Events Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">Events</h4>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setIsAdding(true)}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                </div>
                {events.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic pl-1">No events.</p>
                ) : (
                    <div className="space-y-3">
                        {events.map(event => (
                            <div key={event.id} className="p-4 rounded-xl border-2 bg-card relative group flex gap-4 shadow-sm hover:border-primary/50 transition-all">
                                <div className="flex flex-col items-center justify-center min-w-[70px] border-r-2 pr-4 text-muted-foreground">
                                    {event.time ? (
                                        <span className="text-base font-bold text-foreground tracking-tight">{event.time}</span>
                                    ) : (
                                        <span className="text-xs font-medium italic">All Day</span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1.5 py-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-base leading-none text-foreground">{event.title}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2" onClick={() => onDeleteEvent(event.id)}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                        </Button>
                                    </div>
                                    {event.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>
                                    )}
                                    {event.link && (
                                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-fit pt-1 font-medium">
                                            <LinkIcon className="w-3 h-3" /> Link
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Habits Section */}
            {habits.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-green-500">Habits</h4>
                    <div className="space-y-2">
                        {habits.map(habit => {
                            const isMissed = isBefore(date, startOfToday()) && !habit.isCompleted;
                            return (
                                <div key={habit.id} className={cn("flex items-center gap-3 text-sm p-3 rounded-md border bg-card/50",
                                    isMissed && "border-red-500/50 bg-red-500/5"
                                )}>
                                    <div className={cn("w-3 h-3 rounded-full shrink-0",
                                        habit.isCompleted ? "bg-green-500" : (isMissed ? "bg-red-500" : "bg-zinc-700")
                                    )} />
                                    <span className={cn("flex-1",
                                        habit.isCompleted && "line-through text-muted-foreground",
                                        isMissed && "text-red-500 font-medium"
                                    )}>{habit.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tasks Section */}
            {tasks.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-500 flex items-center justify-between">
                        Tasks <span className="text-[10px] bg-secondary px-1.5 rounded-full text-foreground">{tasks.length}</span>
                    </h4>
                    <div className="space-y-2">
                        {tasks.map(task => {
                            const isMissed = isBefore(date, startOfToday()) && !task.completed;
                            return (
                                <div key={`t-${task.id}`} className={cn("flex items-center gap-3 text-sm p-3 rounded-md border bg-card/50",
                                    isMissed && "border-red-500/50 bg-red-500/5"
                                )}>
                                    <div className={cn("w-3 h-3 rounded-full shrink-0",
                                        task.completed ? "bg-zinc-600" : (isMissed ? "bg-red-500" : getPriorityColor(task.priority))
                                    )} />
                                    <span className={cn("flex-1",
                                        task.completed && "line-through text-muted-foreground",
                                        isMissed && "text-red-500 font-medium"
                                    )}>{task.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Goals Section */}
            {goals.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-purple-500 flex items-center justify-between">
                        Goals <span className="text-[10px] bg-secondary px-1.5 rounded-full text-foreground">{goals.length}</span>
                    </h4>
                    <div className="space-y-2">
                        {goals.map(goal => {
                            const isMissed = isBefore(date, startOfToday()) && !goal.completed;
                            return (
                                <div key={`g-${goal.id}`} className={cn("flex items-center gap-3 text-sm p-3 rounded-md border bg-card/50",
                                    isMissed && "border-red-500/50 bg-red-500/5"
                                )}>
                                    <div className={cn("w-3 h-3 rounded-full shrink-0",
                                        goal.completed ? "bg-green-500" : (isMissed ? "bg-red-500" : "bg-purple-500")
                                    )} />
                                    <span className={cn("flex-1",
                                        goal.completed && "line-through text-muted-foreground",
                                        isMissed && "text-red-500 font-medium"
                                    )}>{goal.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
