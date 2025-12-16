import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, type, description } = body;

        if (!userId || !type || !description) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await db.insert(activities).values({
            userId,
            type,
            description,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId required' }, { status: 400 });
    }

    try {
        const userActivities = await db.select()
            .from(activities)
            .where(eq(activities.userId, userId))
            .orderBy(desc(activities.createdAt))
            .limit(50);

        return NextResponse.json(userActivities);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
