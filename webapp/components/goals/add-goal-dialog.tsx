"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Goal } from "@/lib/types";

export function AddGoalDialog({ onAdd }: { onAdd: (goal: Omit<Goal, "id" | "completed" | "progress">) => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [targetDate, setTargetDate] = useState("");

    // Milestones include an optional date and description now
    const [milestones, setMilestones] = useState<{ title: string; targetDate?: string; description?: string }[]>([]);
    const [newMilestone, setNewMilestone] = useState("");
    const [newMilestoneDate, setNewMilestoneDate] = useState("");
    const [newMilestoneDesc, setNewMilestoneDesc] = useState("");

    const handleAddMilestone = () => {
        if (!newMilestone.trim()) return;

        // Validation: Must have a goal date to validate against (optional, but strict per request)
        if (targetDate && newMilestoneDate && newMilestoneDate > targetDate) {
            toast.error(`Milestone date cannot be after the goal target date (${targetDate}).`);
            return;
        }

        // Validation: Chronological Order
        if (newMilestoneDate && milestones.length > 0) {
            const lastMilestone = milestones[milestones.length - 1];
            if (lastMilestone.targetDate && newMilestoneDate <= lastMilestone.targetDate) {
                toast.error("Milestones must be strictly chronological (after the previous one).");
                return;
            }
        }

        if (newMilestone.trim()) {
            setMilestones([...milestones, {
                title: newMilestone.trim(),
                targetDate: newMilestoneDate || undefined,
                description: newMilestoneDesc.trim() || undefined
            }]);
            setNewMilestone("");
            setNewMilestoneDate("");
            setNewMilestoneDesc("");
        }
    };

    const removeMilestone = (idx: number) => {
        setMilestones(milestones.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Logic: Safety check before submitting
        if (targetDate && milestones.length > 0) {
            for (const m of milestones) {
                if (m.targetDate && m.targetDate > targetDate) {
                    toast.error(`Milestone "${m.title}" cannot be after the goal deadline (${targetDate}).`);
                    return;
                }
            }
        }

        // Chronological Order Validation
        for (let i = 0; i < milestones.length - 1; i++) {
            const current = milestones[i];
            const next = milestones[i + 1];
            if (current.targetDate && next.targetDate) {
                if (current.targetDate >= next.targetDate) {
                    toast.error(`Milestone "${current.title}" must come before "${next.title}".`);
                    return;
                }
            }
        }

        onAdd({
            title,
            targetDate: targetDate || undefined,
            milestones: milestones.map(m => ({
                title: m.title,
                targetDate: m.targetDate,
                description: m.description,
                completed: false
            }))
        });
        setOpen(false);
        setTitle("");
        setTargetDate("");
        setMilestones([]);
        setNewMilestone("");
        setNewMilestoneDate("");
        setNewMilestoneDesc("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Goal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
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

                    <div className="border-t pt-4 space-y-3">
                        <Label className="block font-semibold">Milestones</Label>

                        <div className="space-y-2 bg-secondary/10 p-3 rounded-lg border">
                            <div className="flex gap-2">
                                <Input
                                    value={newMilestone}
                                    onChange={(e) => setNewMilestone(e.target.value)}
                                    placeholder="Milestone title..."
                                    className="flex-1"
                                />
                                <Input
                                    type="date"
                                    value={newMilestoneDate}
                                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                                    className="w-[130px]"
                                />
                            </div>
                            <Textarea
                                value={newMilestoneDesc}
                                onChange={(e) => setNewMilestoneDesc(e.target.value)}
                                placeholder="Milestone notes/description (optional)..."
                                className="h-16 text-xs resize-none"
                            />
                            <Button type="button" size="sm" className="w-full" variant="secondary" onClick={handleAddMilestone}>
                                <Plus className="h-4 w-4 mr-2" /> Add Milestone
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[150px] overflow-y-auto bg-muted/20 p-2 rounded-md">
                            {milestones.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No milestones added.</p>}
                            {milestones.map((m, idx) => (
                                <div key={idx} className="flex items-start justify-between text-sm bg-background p-2 rounded border">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{m.title}</span>
                                        {m.description && <span className="text-xs text-muted-foreground line-clamp-1">{m.description}</span>}
                                        {m.targetDate && <span className="text-[10px] text-blue-500 font-medium">Due: {m.targetDate}</span>}
                                    </div>
                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeMilestone(idx)}>
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
