"use client";

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        });
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);

        if (sub) {
            // SYNC: Ensure backend has this subscription + current timezone
            const { auth } = await import('@/lib/firebase');
            // Wait for auth to be ready

            auth.onAuthStateChanged(async (user: User | null) => {
                if (user) {
                    const token = await user.getIdToken();
                    await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            subscription: sub,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        }),
                    }).catch(err => console.error("Sync failed", err));
                }
            });
        }

        // If no subscription and permission is default, ask
        if (!sub && Notification.permission === 'default') {
            const hasDismissed = localStorage.getItem('push_dismissed');
            if (!hasDismissed) {
                setOpen(true);
            }
        }
    };

    const subscribeToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });

            setSubscription(sub);

            // Send to backend
            const { auth } = await import('@/lib/firebase');
            const token = await auth.currentUser?.getIdToken();

            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subscription: sub }),
            });

            toast.success("Notifications enabled!");
            setOpen(false);
        } catch (error) {
            console.error(error);
            setOpen(false);
            if (Notification.permission === 'denied') {
                toast.error("Permission denied. Check browser settings.");
            } else {
                toast.error("Failed to enable notifications.");
            }
        }
    };

    const unsubscribeFromPush = async () => {
        if (!subscription) return;

        await subscription.unsubscribe();
        setSubscription(null);

        const { auth } = await import('@/lib/firebase');
        const token = await auth.currentUser?.getIdToken();

        await fetch('/api/notifications/subscribe', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        toast.info("Notifications disabled.");
    };

    const handleLater = () => {
        setOpen(false);
        localStorage.setItem('push_dismissed', 'true');
        toast.info("We won't ask again for a while.");
    };

    if (!isSupported) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Enable Notifications</DialogTitle>
                        <DialogDescription>
                            Get notified 30 minutes before your events start so you never miss a deadline.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex justify-center">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Bell className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleLater}>Maybe Later</Button>
                        <Button onClick={subscribeToPush}>Enable Notifications</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function NotificationToggle() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => setSubscription(sub));
            });
        }
    }, []);

    const toggle = async () => {
        if (!subscription) {
            // Subscribe logic (simplified, ideally shared)
            // For now, let's just use the global manager logic via a hack or duplicate it?
            // Duplicating for speed as logic is short.
            try {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                });
                setSubscription(sub);
                const { auth } = await import('@/lib/firebase');
                const token = await auth.currentUser?.getIdToken();
                await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ subscription: sub }),
                });
                toast.success("Notifications enabled!");
            } catch (e) {
                console.error(e);
                toast.error("Failed to enable.");
            }
        } else {
            await subscription.unsubscribe();
            setSubscription(null);
            const { auth } = await import('@/lib/firebase');
            const token = await auth.currentUser?.getIdToken();
            await fetch('/api/notifications/subscribe', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
            });
            toast.info("Notifications disabled.");
        }
    };

    if (!isSupported) return null;

    return (
        <Button variant="ghost" size="icon" onClick={toggle} className="text-muted-foreground hover:text-foreground">
            {subscription ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5" />}
        </Button>
    );
}
