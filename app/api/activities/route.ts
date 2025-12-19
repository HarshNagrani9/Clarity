import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function POST(request: Request) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, description } = body;
        const userId = decodedToken.uid;

        if (!type || !description) {
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
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = decodedToken.uid;

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
