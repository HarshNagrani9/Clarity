import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    try {
        const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));
        return NextResponse.json(userHabits);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newHabit = await db.insert(habits).values(body).returning();
        return NextResponse.json(newHabit[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
    }
}
