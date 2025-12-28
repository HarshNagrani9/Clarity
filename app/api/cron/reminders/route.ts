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

                // We want to find events roughly 30 mins away.
                // Since cron runs every 10 mins, we check a window of [25, 35) minutes.
                // Center our search on "now + 30m" to find the correct date (handling midnight crossings)
                const targetCenter = addMinutes(zonedNow, 30);
                const targetDateStr = format(targetCenter, 'yyyy-MM-dd');

                // 3. Find ALL events for this user on that target date
                // We will filter for the specific time window in memory
                const userEvents = await db.select().from(events).where(
                    and(
                        eq(events.userId, sub.userId),
                        eq(events.date, targetDateStr)
                    )
                );

                for (const event of userEvents) {
                    if (!event.time) continue;

                    // Parse event time locally relative to the user's timezone
                    // Since we know the date is targetDateStr, constructs the full date
                    const eventDateTimeStr = `${event.date}T${event.time}`;
                    const eventNonZoned = new Date(eventDateTimeStr);
                    // Note: direct string parse might imply local/UTC. 
                    // Safer: Construct based on zonedNow's components but with event time.
                    // Actually simpliest: 
                    // We know zonedNow is in User Time. 
                    // Let's rely on simple minute math.
                    const [h, m] = event.time.split(':').map(Number);
                    const eventDate = new Date(zonedNow); // Clone now (which is user-local-ish object or UTC equivalent?)
                    // toZonedTime returns a Date object that represents the time components of the implementation timezone 
                    // as if they were UTC. This trickiness of date-fns-tz means `zonedNow` "looks" like the user time 
                    // if printed as UTC.

                    // Actually, `toZonedTime` returns a Date object.
                    // If we want to compare, we should construct the event date using the user's time components.
                    // But `toZonedTime` shifts the milliseconds.

                    // Robust way with `date-fns-tz`:
                    // 1. We have `zonedNow` (date object shifted to appear as user local).
                    // 2. We set the hours/minutes of `zonedNow` to match event.
                    // 3. Check diff.

                    // However, we must ensure we are on the correct DATE (targetDateStr).
                    // `targetCenter` is already set to the correct date.
                    const eventTarget = new Date(targetCenter);
                    eventTarget.setHours(h);
                    eventTarget.setMinutes(m);
                    eventTarget.setSeconds(0);
                    eventTarget.setMilliseconds(0);

                    // Calculate difference in minutes
                    const diff = (eventTarget.getTime() - zonedNow.getTime()) / (1000 * 60);

                    // Check window: 25 <= diff < 35
                    if (diff >= 25 && diff < 35) {
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
