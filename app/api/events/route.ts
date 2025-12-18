import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

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
    try {
        const body = await request.json();
        const newEvent = await db.insert(events).values(body).returning();
        return NextResponse.json(newEvent[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
