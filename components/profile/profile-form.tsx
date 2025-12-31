"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Loader2 } from "lucide-react";

export function ProfileForm({ user }: { user: UserProfile }) {
    const { updatePreferences } = useApp(); // We might need a better way to refresh user profile globally, 
    // but for now we'll rely on page refresh or simple state update if possible.
    // Actually, standard fetch update is fine.

    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState(user.displayName || "");
    const [mobile, setMobile] = useState(user.mobile || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await import('@/lib/firebase').then(m => m.auth.currentUser?.getIdToken());

            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ displayName, mobile })
            });

            if (!res.ok) throw new Error('Failed to update profile');

            toast.success("Profile updated successfully");
            // Ideally we'd update the global context here, but a page reload works too for this MVP
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                            id="mobile"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+1234567890"
                        />
                        <p className="text-xs text-muted-foreground">Used for notifications and account recovery.</p>
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
