import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    try {
        const userGoals = await db.select().from(goals).where(eq(goals.userId, userId));
        return NextResponse.json(userGoals);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Ensure targetDate is a Date object if strictly required by schema, 
        // but Drizzle often handles ISO text automatically.
        // However, for timestamp fields, text is usually fine in JSON.
        const newGoal = await db.insert(goals).values({
            ...body,
            targetDate: body.targetDate ? new Date(body.targetDate) : null,
        }).returning();
        return NextResponse.json(newGoal[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}
