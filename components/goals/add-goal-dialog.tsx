"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import { Goal } from "@/lib/types";

export function AddGoalDialog({ onAdd }: { onAdd: (goal: Omit<Goal, "id" | "completed" | "progress">) => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [targetDate, setTargetDate] = useState("");

    // Milestones include an optional date now
    const [milestones, setMilestones] = useState<{ title: string; targetDate?: string }[]>([]);
    const [newMilestone, setNewMilestone] = useState("");
    const [newMilestoneDate, setNewMilestoneDate] = useState("");

    const handleAddMilestone = () => {
        if (newMilestone.trim()) {
            setMilestones([...milestones, {
                title: newMilestone.trim(),
                targetDate: newMilestoneDate || undefined
            }]);
            setNewMilestone("");
            setNewMilestoneDate("");
        }
    };

    const removeMilestone = (idx: number) => {
        setMilestones(milestones.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            title,
            targetDate: targetDate || undefined,
            milestones: milestones.map(m => ({
                title: m.title,
                targetDate: m.targetDate,
                completed: false
            }))
        });
        setOpen(false);
        setTitle("");
        setTargetDate("");
        setMilestones([]);
        setNewMilestone("");
        setNewMilestoneDate("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Goal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Set New Goal</DialogTitle>
                    <DialogDescription>
                        Define your goal and break it down into milestones.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Goal</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="Launch Product"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Target</Label>
                        <Input
                            id="date"
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <Label className="block mb-2 font-semibold">Milestones</Label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                value={newMilestone}
                                onChange={(e) => setNewMilestone(e.target.value)}
                                placeholder="Milestone title..."
                                className="flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMilestone();
                                    }
                                }}
                            />
                            <Input
                                type="date"
                                value={newMilestoneDate}
                                onChange={(e) => setNewMilestoneDate(e.target.value)}
                                className="w-[130px]"
                            />
                            <Button type="button" size="icon" variant="secondary" onClick={handleAddMilestone}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[120px] overflow-y-auto bg-muted/20 p-2 rounded-md">
                            {milestones.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No milestones added.</p>}
                            {milestones.map((m, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm bg-background p-2 rounded border">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{m.title}</span>
                                        {m.targetDate && <span className="text-[10px] text-muted-foreground">Due: {m.targetDate}</span>}
                                    </div>
                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeMilestone(idx)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Create Goal</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
