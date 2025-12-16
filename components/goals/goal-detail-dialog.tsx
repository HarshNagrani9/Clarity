"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Goal } from "@/lib/types";
import { Plus, X, ExternalLink } from "lucide-react";

interface GoalDetailDialogProps {
    goal: Goal;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, updates: Partial<Goal>) => void;
}

export function GoalDetailDialog({ goal, open, onOpenChange, onUpdate }: GoalDetailDialogProps) {
    const [description, setDescription] = useState(goal.description || "");
    const [notes, setNotes] = useState(goal.notes || "");
    const [resources, setResources] = useState<{ title: string; url: string }[]>(goal.resources || []);
    const [newResourceTitle, setNewResourceTitle] = useState("");
    const [newResourceUrl, setNewResourceUrl] = useState("");

    const handleSave = () => {
        onUpdate(goal.id, { description, notes, resources });
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
                    <DialogTitle>{goal.title}</DialogTitle>
                    <DialogDescription>Goal Details & Resources</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of the goal..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Detailed notes, thoughts, or progress updates..."
                            className="min-h-[150px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Milestones & Notes</Label>
                        <div className="space-y-3">
                            {goal.milestones.map((milestone, idx) => (
                                <div key={idx} className="p-3 border rounded-lg bg-card space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{milestone.title}</span>
                                        {milestone.targetDate && (
                                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                                {milestone.targetDate}
                                            </span>
                                        )}
                                    </div>
                                    <Textarea
                                        placeholder="Add notes for this milestone..."
                                        value={milestone.description || ""}
                                        onChange={(e) => {
                                            const newMilestones = [...goal.milestones];
                                            newMilestones[idx] = { ...newMilestones[idx], description: e.target.value };
                                            onUpdate(goal.id, { milestones: newMilestones });
                                        }}
                                        className="text-xs min-h-[60px]"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Resources</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Title (e.g., Tutorial)"
                                value={newResourceTitle}
                                onChange={(e) => setNewResourceTitle(e.target.value)}
                            />
                            <Input
                                placeholder="URL"
                                value={newResourceUrl}
                                onChange={(e) => setNewResourceUrl(e.target.value)}
                            />
                            <Button onClick={addResource} size="icon"><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="space-y-2 mt-2">
                            {resources.map((res, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-secondary/20 rounded border">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate text-blue-500">
                                            {res.title}
                                        </a>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeResource(idx)} className="h-6 w-6">
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
