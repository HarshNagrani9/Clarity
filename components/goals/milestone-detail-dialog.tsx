"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Goal } from "@/lib/types";
import { Plus, X, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface MilestoneDetailDialogProps {
    goal: Goal;
    milestoneIndex: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, updates: Partial<Goal>) => void;
}

export function MilestoneDetailDialog({ goal, milestoneIndex, open, onOpenChange, onUpdate }: MilestoneDetailDialogProps) {
    // Guard against invalid index
    const milestone = goal.milestones[milestoneIndex] || { title: "", completed: false };

    const [title, setTitle] = useState(milestone.title);
    const [targetDate, setTargetDate] = useState(milestone.targetDate || "");
    const [description, setDescription] = useState(milestone.description || "");
    const [notes, setNotes] = useState(milestone.notes || "");
    const [resources, setResources] = useState<{ title: string; url: string }[]>(milestone.resources || []);

    // Resource input state
    const [newResourceTitle, setNewResourceTitle] = useState("");
    const [newResourceUrl, setNewResourceUrl] = useState("");

    // Reset state when milestone changes
    useEffect(() => {
        if (open && goal.milestones[milestoneIndex]) {
            const m = goal.milestones[milestoneIndex];
            setTitle(m.title || "");
            setTargetDate(m.targetDate || "");
            setDescription(m.description || "");
            setNotes(m.notes || "");
            setResources(m.resources || []);
        }
    }, [open, milestoneIndex, goal.milestones]);

    const handleSave = () => {
        const newMilestones = [...goal.milestones];
        newMilestones[milestoneIndex] = {
            ...newMilestones[milestoneIndex],
            title,
            targetDate: targetDate || undefined,
            description,
            notes,
            resources
        };

        onUpdate(goal.id, { milestones: newMilestones });
        onOpenChange(false);
    };

    const addResource = () => {
        if (newResourceTitle && newResourceUrl) {
            setResources([...resources, { title: newResourceTitle, url: newResourceUrl }]);
            setNewResourceTitle("");
            setNewResourceUrl("");
        }
    };

    const removeResource = (index: number) => {
        setResources(resources.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <DialogTitle>{title || "Milestone Details"}</DialogTitle>
                        {milestone.completed && <span className="text-xs font-medium text-green-500 bg-green-100 px-2 py-0.5 rounded-full">Completed</span>}
                    </div>
                    <DialogDescription>Manage details, notes, and resources for this specific milestone.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Target Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Overview)</Label>
                        <Textarea
                            id="description"
                            placeholder="What is this milestone about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Status Notes & Updates</Label>
                        <Textarea
                            id="notes"
                            placeholder="Track your progress, thoughts, or blockers here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Resources & Links</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Link Title"
                                value={newResourceTitle}
                                onChange={(e) => setNewResourceTitle(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                placeholder="URL"
                                value={newResourceUrl}
                                onChange={(e) => setNewResourceUrl(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={addResource} size="icon"><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="space-y-2 mt-2">
                            {resources.length === 0 && <p className="text-xs text-muted-foreground">No resources added.</p>}
                            {resources.map((res, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-secondary/20 rounded border">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate text-blue-500">
                                            {res.title}
                                        </a>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeResource(idx)} className="h-6 w-6 text-destructive">
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave}>Save Milestone Details</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
