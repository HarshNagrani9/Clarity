import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits, habitCompletions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';
import { calculateStreak } from '@/lib/streak';

export async function GET(request: Request) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    try {
        const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));

        // Fetch all completions for this user in one query
        const allCompletions = await db.select().from(habitCompletions).where(eq(habitCompletions.userId, userId));

        // Group completions by habitId
        const completionsByHabit: Record<number, string[]> = {};
        for (const c of allCompletions) {
            if (!completionsByHabit[c.habitId]) {
                completionsByHabit[c.habitId] = [];
            }
            completionsByHabit[c.habitId].push(c.date);
        }

        // Reconstruct completedDates and streak for each habit
        const enrichedHabits = userHabits.map(habit => {
            const dates = completionsByHabit[habit.id] || [];
            return {
                ...habit,
                completedDates: dates,
                streak: calculateStreak(dates),
            };
        });

        return NextResponse.json(enrichedHabits);
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
