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
import { eq, and } from 'drizzle-orm';
import webpush from 'web-push';
import { addMinutes, format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz'; // Ensure you have date-fns-tz installed

webpush.setVapidDetails(
    'mailto:noreply@clarity.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
);

export async function GET(request: Request) {
    try {
        const subscriptions = await db.select().from(pushSubscriptions);

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: true, message: "No subscriptions" });
        }

        const notificationsSent = [];

        // 1. Current Absolute Server Time (UTC)
        const now = new Date();

        for (const sub of subscriptions) {
            try {
                // If sub.timezone is null, this defaults to UTC and CAUSES your 5.5h bug.
                // Ensure your frontend saves 'Asia/Kolkata' for Indian users.
                const userTimezone = sub.timezone || 'UTC';

                // 2. Find out what date it is for the user RIGHT NOW + 30 mins
                // We use this strictly to filter the DB query (optimization)
                const zonedNow = toZonedTime(now, userTimezone);
                const searchWindowCenter = addMinutes(zonedNow, 30);
                const searchDateStr = format(searchWindowCenter, 'yyyy-MM-dd');

                // 3. Get events for that specific date string
                const userEvents = await db.select().from(events).where(
                    and(
                        eq(events.userId, sub.userId),
                        eq(events.date, searchDateStr)
                    )
                );

                for (const event of userEvents) {
                    if (!event.time) continue;

                    // 4. Construct the Event's ABSOLUTE timestamp
                    // Combine the stored date and time strings: "2024-12-29T14:30:00"
                    const eventDateTimeStr = `${event.date}T${event.time}`; // Ensure event.time is HH:mm or HH:mm:ss

                    // Convert that Local String -> Absolute UTC Date Object using the User's Timezone
                    const eventAbsoluteDate = fromZonedTime(eventDateTimeStr, userTimezone);

                    // 5. Calculate diff in minutes using Absolute Timestamps
                    // (Event Time - Current Server Time)
                    const diffInMinutes = (eventAbsoluteDate.getTime() - now.getTime()) / (1000 * 60);

                    // console.log(`Debug: User ${sub.userId} | Event: ${event.title} | Diff: ${diffInMinutes.toFixed(2)} mins`);

                    // Check window: 25 <= diff < 35
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

                        notificationsSent.push({
                            event: event.title,
                            user: sub.userId,
                            scheduledFor: eventDateTimeStr,
                            sentAt: new Date().toISOString()
                        });
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