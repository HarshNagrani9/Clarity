import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function GET(request: Request) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    try {
        const userEvents = await db.select()
            .from(events)
            .where(eq(events.userId, userId))
            .orderBy(desc(events.date));

        return NextResponse.json(userEvents);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        // Overwrite userId with authenticated one
        const newEvent = await db.insert(events).values({
            ...body,
            userId: decodedToken.uid
        }).returning();
        return NextResponse.json(newEvent[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
