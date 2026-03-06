import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function GET(request: Request) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ignore query param userId, use authenticated user
    const userId = decodedToken.uid;

    try {
        const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));
        return NextResponse.json(userHabits);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, frequency, frequencyDays, color, startDate, endDate } = body;
        const userId = decodedToken.uid;

        const newHabit = await db.insert(habits).values({
            userId,
            title,
            description,
            frequency,
            frequencyDays: frequencyDays || [],
            color: color || '#22c55e',
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
        }).returning();
        return NextResponse.json(newHabit[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
    }
}
