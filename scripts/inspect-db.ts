
import { db } from '@/lib/db';
import { pushSubscriptions, events } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function inspectState() {
    console.log('🔍 Inspecting Subscriptions and Events...');

    // 1. Get All Subscriptions
    const allSubs = await db.select().from(pushSubscriptions);
    console.log(`\n📋 Total Subscriptions: ${allSubs.length}`);

    // Group by UserID to see duplicates
    const subsByUser: Record<string, any[]> = {};
    allSubs.forEach(sub => {
        if (!subsByUser[sub.userId]) subsByUser[sub.userId] = [];
        subsByUser[sub.userId].push(sub);
    });

    Object.entries(subsByUser).forEach(([userId, subs]) => {
        console.log(`   User ${userId.slice(0, 8)}... has ${subs.length} subscription(s)`);
        subs.forEach((s, i) => {
            console.log(`      ${i + 1}. Endpoint: ...${s.endpoint.slice(-20)} | Timezone: ${s.timezone}`);
        });
    });

    // 2. Get Events for Today (manual check)
    // We'll just dump all events to see if Browser 3's event exists
    const allEvents = await db.select().from(events);
    console.log(`\n📅 Total Events: ${allEvents.length}`);

    // Filter for "7:00 pm" (19:00) events roughly
    const relevantEvents = allEvents.filter(e => e.time === '19:00' || e.time === '07:00' || e.time === '7:00');
    console.log(`   Found ${relevantEvents.length} events at 19:00/7:00`);

    relevantEvents.forEach(e => {
        console.log(`      Event "${e.title}" for User ${e.userId.slice(0, 8)}... Date: ${e.date}`);
    });
}

inspectState().then(() => process.exit(0)).catch(console.error);
