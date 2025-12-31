"use client";

import { useApp } from "@/lib/store";
import { ProfileForm } from "@/components/profile/profile-form";
import { User } from "lucide-react";

export default function ProfilePage() {
    const { userProfile } = useApp();

    if (!userProfile) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your profile and security preferences.</p>
                </div>
            </div>

            <div className="space-y-6">
                <ProfileForm user={userProfile} />
            </div>
        </div>
    );
}
