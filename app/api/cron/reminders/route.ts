import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, pushSubscriptions } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import webpush from 'web-push';
import { addMinutes, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Configure Web Push with VAPID keys
webpush.setVapidDetails(
    'mailto:noreply@clarity.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
);

export async function GET(request: Request) {
    try {
        // 1. Get all active subscriptions
        const subscriptions = await db.select().from(pushSubscriptions);

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: "No subscriptions" });
        }

        const notificationsSent = [];

        // 2. Iterate through subscriptions to check if THEIR specific user has an event coming up
        // (This is not the most optimized for scale, but it guarantees timezone correctness per user)
        for (const sub of subscriptions) {
            try {
                const userTimezone = sub.timezone || 'UTC';
                const now = new Date();

                // Get 'now' in the user's timezone
                const zonedNow = toZonedTime(now, userTimezone);
                const targetTime = addMinutes(zonedNow, 30);

                // Format directly to match our DB storage: "YYYY-MM-DD" and "HH:mm"
                const targetDateStr = format(targetTime, 'yyyy-MM-dd');
                const targetTimeStr = format(targetTime, 'HH:mm');

                // 3. Find events for this user at this exact minute (30 mins from now)
                const userEvents = await db.select().from(events).where(
                    and(
                        eq(events.userId, sub.userId),
                        eq(events.date, targetDateStr),
                        eq(events.time, targetTimeStr)
                    )
                );

                for (const event of userEvents) {
                    const payload = JSON.stringify({
                        title: 'Upcoming Event',
                        body: `"${event.title}" is starting in 30 minutes!`,
                        url: event.link || '/dashboard'
                    });

                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: sub.keys as any
                    }, payload);

                    notificationsSent.push({ event: event.title, user: sub.userId });
                }

            } catch (err: any) {
                console.error(`Error processing sub ${sub.id}:`, err);
                if (err.statusCode === 410) {
                    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                }
            }
        }

        return NextResponse.json({ success: true, sent: notificationsSent.length, details: notificationsSent });

    } catch (error) {
        console.error('Cron Job Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
