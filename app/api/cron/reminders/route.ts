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
        for (const sub of subscriptions) {
            try {
                const userTimezone = (sub.timezone === 'UTC' || !sub.timezone) ? 'Asia/Kolkata' : sub.timezone;
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

                    // Logic: Parse event time on that specific date
                    const [h, m] = event.time.split(':').map(Number);

                    // Construct event date based on our target center date
                    const eventTarget = new Date(targetCenter);
                    eventTarget.setHours(h);
                    eventTarget.setMinutes(m);
                    eventTarget.setSeconds(0);
                    eventTarget.setMilliseconds(0);

                    // Calculate difference in minutes from "user's now"
                    const diff = (eventTarget.getTime() - zonedNow.getTime()) / (1000 * 60);

                    // Check window: 25 <= diff < 35
                    // Example: Event is at 3:25. Cron runs at 2:50 (Diff=35 -> Skip).
                    //          Cron runs at 3:00 (Diff=25 -> MATCH).
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

// import { NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { events, pushSubscriptions } from '@/lib/schema';
// import { eq, and } from 'drizzle-orm';
// import webpush from 'web-push';
// import { addMinutes, format } from 'date-fns';
// import { format as formatTz } from 'date-fns-tz';

// // Configure Web Push with VAPID keys
// webpush.setVapidDetails(
//     'mailto:noreply@clarity.com',
//     process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
//     process.env.VAPID_PRIVATE_KEY || ''
// );

// export async function GET(request: Request) {
//     try {
//         // Current UTC time (cron-job.org runs in UTC, but we will always convert to user timezone)
//         const nowUtc = new Date();

//         const subscriptions = await db.select().from(pushSubscriptions);

//         if (subscriptions.length === 0) {
//             return NextResponse.json({
//                 success: true,
//                 sent: 0,
//                 message: 'No subscriptions',
//             });
//         }

//         const notificationsSent: { event: string; user: string }[] = [];

//         console.log(`[DEBUG] Found ${subscriptions.length} subscription(s)`);

//         for (const sub of subscriptions) {
//             try {
//                 // Use stored user timezone, falling back to IST (Asia/Kolkata)
//                 const userTimezone = sub.timezone || 'Asia/Kolkata';

//                 // Get current time components in user's timezone (IST) using formatTz
//                 // This ensures we get the actual hours/minutes in IST, not UTC
//                 const currentTimeStr = formatTz(nowUtc, 'HH:mm', { timeZone: userTimezone });
//                 const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
//                 const nowMinutes = currentHour * 60 + currentMinute;

//                 // Calculate target date: 30 minutes from now in user's timezone
//                 // We add 30 minutes to UTC, then format to get the date in IST
//                 const targetUtcTime = addMinutes(nowUtc, 30);
//                 const targetDateStr = formatTz(targetUtcTime, 'yyyy-MM-dd', { timeZone: userTimezone });

//                 console.log(`[DEBUG] User: ${sub.userId}, Timezone: ${userTimezone}`);
//                 console.log(`[DEBUG] Now UTC: ${nowUtc.toISOString()}`);
//                 console.log(`[DEBUG] Now in ${userTimezone}: ${currentHour}:${String(currentMinute).padStart(2, '0')} (${nowMinutes} minutes)`);
//                 console.log(`[DEBUG] Target date: ${targetDateStr}`);

//                 // Fetch events for the target date (when notification should be sent, 30 mins before event)
//                 // Events are stored with date in user's local timezone format (YYYY-MM-DD)
//                 const userEvents = await db
//                     .select()
//                     .from(events)
//                     .where(
//                         and(
//                             eq(events.userId, sub.userId),
//                             eq(events.date, targetDateStr)
//                         )
//                     );

//                 console.log(`[DEBUG] Found ${userEvents.length} event(s) for date ${targetDateStr}`);

//                 for (const event of userEvents) {
//                     if (!event.time) {
//                         console.log(`[DEBUG] Event "${event.title}" has no time field, skipping`);
//                         continue;
//                     }

//                     const [h, m] = event.time.split(':').map(Number);
//                     const eventMinutes = h * 60 + m;
                    
//                     // Calculate difference in minutes
//                     // Handle day rollover: if event is early morning (e.g., 2:00) and we're late night (e.g., 23:50)
//                     let diff = eventMinutes - nowMinutes;
//                     if (diff < 0) {
//                         // Event is on next day
//                         diff = (24 * 60) + diff;
//                     }

//                     console.log(`[DEBUG] Event: "${event.title}" at ${event.time} (${eventMinutes} minutes), diff: ${diff} minutes`);

//                     // Send when event is between 25 and 35 minutes away in the user's timezone.
//                     // Example: event at 03:20 IST, cron at 02:50 IST -> diff = 30 -> MATCH
//                     // Cron-job.org runs in UTC, but we convert to IST for comparison
//                     if (diff >= 25 && diff < 35) {
//                         console.log(`[DEBUG] ✓ MATCH! Sending notification for "${event.title}"`);
//                         const payload = JSON.stringify({
//                             title: 'Upcoming Event',
//                             body: `"${event.title}" is starting in 30 minutes!`,
//                             url: event.link || '/dashboard',
//                         });

//                         await webpush.sendNotification(
//                             {
//                                 endpoint: sub.endpoint,
//                                 keys: sub.keys as any,
//                             },
//                             payload
//                         );

//                         notificationsSent.push({
//                             event: event.title,
//                             user: sub.userId,
//                         });
//                     } else {
//                         console.log(`[DEBUG] ✗ Event "${event.title}" diff (${diff}) not in window [25, 35)`);
//                     }
//                 }
//             } catch (err: any) {
//                 console.error(`Error processing sub ${sub.id}:`, err);
//                 if (err.statusCode === 410) {
//                     await db
//                         .delete(pushSubscriptions)
//                         .where(eq(pushSubscriptions.id, sub.id));
//                 }
//             }
//         }

//         console.log(`[DEBUG] Summary: Sent ${notificationsSent.length} notification(s)`);

//         return NextResponse.json({
//             success: true,
//             sent: notificationsSent.length,
//             details: notificationsSent,
//         });
//     } catch (error) {
//         console.error('Cron Job Error:', error);
//         return NextResponse.json(
//             { error: 'Internal Server Error' },
//             { status: 500 }
//         );
//     }
// }