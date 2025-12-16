"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Habit } from "@/lib/types";

export function AddHabitDialog({ onAdd }: { onAdd: (habit: Omit<Habit, "id" | "streak" | "completedDates">) => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
    const [color, setColor] = useState("#22c55e");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ title, frequency, color });
        setOpen(false);
        setTitle("");
        setFrequency("daily");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Habit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Habit</DialogTitle>
                    <DialogDescription>
                        Add a new habit to track your progress.
                    </DialogDescription>
                </DialogHeader>
                <form id="add-habit-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="Read 30 mins"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="frequency" className="text-right">
                            Frequency
                        </Label>
                        <Select value={frequency} onValueChange={(v: "daily" | "weekly") => setFrequency(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">
                            Color
                        </Label>
                        <div className="col-span-3 flex gap-2">
                            {['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-foreground' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" form="add-habit-form">Save Habit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
