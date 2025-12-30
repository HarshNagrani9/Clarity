import React, { useEffect, useRef } from "react";
import { format, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileDateStripProps {
    days: Date[];
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    getItemsForDate: (date: Date) => { events: any[]; tasks: any[]; goals: any[]; habits?: any[] };
    onAddClick?: () => void;
}

export function MobileDateStrip({ days, selectedDate, onSelectDate, getItemsForDate, onAddClick }: MobileDateStripProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedDate && scrollContainerRef.current) {
            const selectedId = `date-strip-${format(selectedDate, 'yyyy-MM-dd')}`;
            const element = document.getElementById(selectedId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [selectedDate]);

    return (
        <div ref={scrollContainerRef} className="flex overflow-x-auto gap-3 pb-4 px-2 scrollbar-hide snap-x pt-2">
            {days.map((day) => {
                const { events, tasks, goals } = getItemsForDate(day);
                const hasItems = events.length > 0 || tasks.length > 0 || goals.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const dayId = `date-strip-${format(day, 'yyyy-MM-dd')}`;

                return (
                    <div
                        key={day.toISOString()}
                        id={dayId}
                        onClick={() => onSelectDate(day)}
                        className={cn(
                            "group relative flex flex-col items-center justify-between min-w-[4.5rem] w-[4.5rem] h-[5.5rem] p-2 rounded-2xl border transition-all snap-center shrink-0 shadow-sm",
                            isSelected
                                ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 shadow-md scale-105 z-10"
                                : "bg-card hover:bg-accent/50 border-border opacity-90",
                            isToday(day) && !isSelected && "border-primary/50 text-foreground ring-1 ring-primary/20"
                        )}
                    >
                        {/* Header: Day Name */}
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                            {format(day, "EEE")}
                        </span>

                        {/* Body: Date Number */}
                        <span className={cn(
                            "text-2xl font-black tracking-tight -mt-1",
                            isSelected ? "text-primary-foreground" : "text-foreground"
                        )}>
                            {format(day, "d")}
                        </span>

                        {/* Footer: Rectangular Tags or + Button */}
                        <div className="w-full h-5 flex flex-col justify-end items-center gap-0.5">
                            {isSelected ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 rounded-full hover:bg-black/20 text-current p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onAddClick) onAddClick();
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-[2px] w-full px-1">
                                    {events.length > 0 && (
                                        <div className="w-full h-[3px] rounded-full bg-blue-500 opacity-80" />
                                    )}
                                    {tasks.length > 0 && (
                                        <div className="w-full h-[3px] rounded-full bg-orange-500 opacity-80" />
                                    )}
                                    {goals.length > 0 && (
                                        <div className="w-full h-[3px] rounded-full bg-purple-500 opacity-80" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
