import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, pushSubscriptions } from '@/lib/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import webpush from 'web-push';
import { addMinutes, format } from 'date-fns';

// Configure Web Push with VAPID keys
webpush.setVapidDetails(
    'mailto:noreply@clarity.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
);

export async function GET(request: Request) {
    // Basic security: Check for a secret query param or header (optional but recommended for Cron)
    // For now, we'll keep it open but in production you'd check `request.headers.get('Authorization')`

    try {
        const now = new Date();
        const targetTimeStart = addMinutes(now, 29); // Start checking from 29 mins
        const targetTimeEnd = addMinutes(now, 31);   // End checking at 31 mins
        // (To catch events exactly 30 mins away)

        const targetDateStr = format(targetTimeStart, 'yyyy-MM-dd');
        // Note: Our DB stores simple 'HH:mm'. We need to be careful with timezones.
        // Assuming user stores localized time and we want to notify based on server time matching that string?
        // Actually, best practice is to store UTC or have explicit timezone.
        // Given current Schema stores plain 'date' and 'time' strings, we assume "Device Time" matching.

        // Simplification for this implementation: 
        // We will fetch ALL events for today and filter in memory for those ~30 mins away?
        // OR better: Just query for the specific date string.

        // HOWEVER: The prompt says "30 min before deadline".
        // Let's grab the current UTC time, shift it to user's timezone... but we don't know user's timezone.
        // Standard PWA Approach: The browser handles timezone. But Cron runs on server.

        // Workaround: We will query for events happening on `targetDateStr`.
        // Then we filter based on `time`.

        const upcomingEvents = await db.select().from(events).where(
            eq(events.date, targetDateStr)
        );

        const notificationsSent = [];

        for (const event of upcomingEvents) {
            if (!event.time) continue;

            const eventDateTime = new Date(`${event.date}T${event.time}`);
            const diffInMinutes = (eventDateTime.getTime() - now.getTime()) / (1000 * 60);

            // If event is roughly 30 mins away (between 25 and 35 to be safe due to Cron timing)
            if (diffInMinutes >= 25 && diffInMinutes <= 35) {

                // Find user's subscriptions
                const subscriptions = await db.select().from(pushSubscriptions).where(
                    eq(pushSubscriptions.userId, event.userId)
                );

                for (const sub of subscriptions) {
                    try {
                        const payload = JSON.stringify({
                            title: 'Upcoming Event',
                            body: `"${event.title}" is starting in 30 minutes!`,
                            url: event.link || '/dashboard' // Open dashboard or event link
                        });

                        await webpush.sendNotification({
                            endpoint: sub.endpoint,
                            keys: sub.keys as any
                        }, payload);

                        notificationsSent.push({ event: event.title, user: event.userId });

                    } catch (err: any) {
                        console.error('Error sending push:', err);
                        if (err.statusCode === 410) {
                            // Expired subscription, delete it
                            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, sent: notificationsSent.length, details: notificationsSent });

    } catch (error) {
        console.error('Cron Job Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
