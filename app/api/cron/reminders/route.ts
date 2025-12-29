// import { NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { events, pushSubscriptions } from '@/lib/schema';
// import { eq, and } from 'drizzle-orm';
// import webpush from 'web-push';
// import { addMinutes, format } from 'date-fns';
// import { toZonedTime } from 'date-fns-tz';

// // Configure Web Push with VAPID keys
// webpush.setVapidDetails(
//     'mailto:noreply@clarity.com',
//     process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
//     process.env.VAPID_PRIVATE_KEY || ''
// );

// export async function GET(request: Request) {
//     try {
//         // 1. Get all active subscriptions
//         const subscriptions = await db.select().from(pushSubscriptions);

//         if (subscriptions.length === 0) {
//             return NextResponse.json({ success: true, sent: 0, message: "No subscriptions" });
//         }

//         const notificationsSent = [];

//         // 2. Iterate through subscriptions to check if THEIR specific user has an event coming up
//         for (const sub of subscriptions) {
//             try {
//                 const userTimezone = sub.timezone || 'UTC';
//                 const now = new Date();

//                 // Get 'now' in the user's timezone
//                 const zonedNow = toZonedTime(now, userTimezone);

//                 // We want to find events roughly 30 mins away.
//                 // Since cron runs every 10 mins, we check a window of [25, 35) minutes.
//                 // Center our search on "now + 30m" to find the correct date (handling midnight crossings)
//                 const targetCenter = addMinutes(zonedNow, 30);
//                 const targetDateStr = format(targetCenter, 'yyyy-MM-dd');

//                 // 3. Find ALL events for this user on that target date
//                 // We will filter for the specific time window in memory
//                 const userEvents = await db.select().from(events).where(
//                     and(
//                         eq(events.userId, sub.userId),
//                         eq(events.date, targetDateStr)
//                     )
//                 );

//                 for (const event of userEvents) {
//                     if (!event.time) continue;

//                     // Logic: Parse event time on that specific date
//                     const [h, m] = event.time.split(':').map(Number);

//                     // Construct event date based on our target center date
//                     const eventTarget = new Date(targetCenter);
//                     eventTarget.setHours(h);
//                     eventTarget.setMinutes(m);
//                     eventTarget.setSeconds(0);
//                     eventTarget.setMilliseconds(0);

//                     // Calculate difference in minutes from "user's now"
//                     const diff = (eventTarget.getTime() - zonedNow.getTime()) / (1000 * 60);

//                     // Check window: 25 <= diff < 35
//                     // Example: Event is at 3:25. Cron runs at 2:50 (Diff=35 -> Skip).
//                     //          Cron runs at 3:00 (Diff=25 -> MATCH).
//                     if (diff >= 25 && diff < 35) {
//                         const payload = JSON.stringify({
//                             title: 'Upcoming Event',
//                             body: `"${event.title}" is starting in 30 minutes!`,
//                             url: event.link || '/dashboard'
//                         });

//                         await webpush.sendNotification({
//                             endpoint: sub.endpoint,
//                             keys: sub.keys as any
//                         }, payload);

//                         notificationsSent.push({ event: event.title, user: sub.userId });
//                     }
//                 }

//             } catch (err: any) {
//                 console.error(`Error processing sub ${sub.id}:`, err);
//                 if (err.statusCode === 410) {
//                     await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
//                 }
//             }
//         }

//         return NextResponse.json({ success: true, sent: notificationsSent.length, details: notificationsSent });

//     } catch (error) {
//         console.error('Cron Job Error:', error);
//         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, pushSubscriptions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import webpush from 'web-push';
import { addMinutes } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

webpush.setVapidDetails(
    'mailto:noreply@clarity.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
);

export async function GET(request: Request) {
    try {
        // 1. Current Server Time (This is always UTC in Vercel/Cron)
        const now = new Date();

        // 2. We don't calculate the window here anymore. 
        // We will calculate the "diff" for every event individually based on its timezone.

        const subscriptions = await db.select().from(pushSubscriptions);

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: true, message: "No subscriptions" });
        }

        const notificationsSent = [];

        for (const sub of subscriptions) {
            try {
                // Fetch events for this user
                const userEvents = await db.select().from(events).where(
                    eq(events.userId, sub.userId)
                );

                // Get the user's timezone from the subscription table
                // If missing, fallback to UTC (which mimics your old behavior)
                const userTimezone = sub.timezone || 'UTC';

                for (const event of userEvents) {

                    // FIX STARTS HERE -----------------------------------------

                    // We assume event.date is a string like "2025-12-29 14:00:00"
                    // We combine this string with the user's timezone to get the REAL absolute time.

                    // This converts "14:00" in "Asia/Kolkata" -> Date Object (08:30 UTC)
                    const eventTime = fromZonedTime(event.date, userTimezone);

                    // ---------------------------------------------------------

                    // 3. Calculate Difference
                    // Now we are comparing two UTC objects:
                    // 1. now (Current Real UTC)
                    // 2. eventTime (Event's Real UTC)
                    const diffInMinutes = (eventTime.getTime() - now.getTime()) / (1000 * 60);

                    // Debugging (Remove in production)
                    // console.log(`User TZ: ${userTimezone} | Event: ${event.title} | Diff: ${diffInMinutes}m`);

                    // 4. Check if it matches the 30-minute window
                    if (diffInMinutes >= 25 && diffInMinutes < 35) {
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