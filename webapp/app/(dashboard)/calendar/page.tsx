"use client";

import { EventCalendar } from "@/components/calendar/event-calendar";

export default function CalendarPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                <p className="text-muted-foreground">Manage your events, meetings, and plans.</p>
            </div>

            <div className="flex-1 min-h-0">
                <EventCalendar />
            </div>
        </div>
    );
}
