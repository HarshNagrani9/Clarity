import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits, habitCompletions } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const authUserId = decodedToken.uid;

    try {
        const body = await request.json();
        const { toggleDate, userId, ...updateData } = body;

        // Analytics: Handle separate normalized table
        if (toggleDate) {
            const habitId = parseInt(id);

            // Check if already completed (scoped to auth user)
            const existing = await db.select().from(habitCompletions).where(
                and(
                    eq(habitCompletions.habitId, habitId),
                    eq(habitCompletions.date, toggleDate),
                    eq(habitCompletions.userId, authUserId)
                )
            );

            if (existing.length > 0) {
                // If exists, remove it (Uncheck)
                await db.delete(habitCompletions).where(
                    and(
                        eq(habitCompletions.habitId, habitId),
                        eq(habitCompletions.date, toggleDate),
                        eq(habitCompletions.userId, authUserId)
                    )
                );
            } else {
                // If not exists, insert it (Check)
                await db.insert(habitCompletions).values({
                    habitId,
                    userId: authUserId, // Force auth user
                    date: toggleDate
                });
            }
        }

        // Recalculate Streak if completedDates is being updated
        if (updateData.completedDates) {
            const { calculateStreak } = await import('@/lib/streak');
            updateData.streak = calculateStreak(updateData.completedDates);
        }

        // Update the main habits table (for UI/JSONB consistency)
        const updatedHabit = await db
            .update(habits)
            .set(updateData)
            .where(and(eq(habits.id, parseInt(id)), eq(habits.userId, authUserId)))
            .returning();

        if (updatedHabit.length === 0) return NextResponse.json({ error: 'Habit not found or unauthorized' }, { status: 404 });

        return NextResponse.json(updatedHabit[0]);
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        await db.delete(habits).where(and(eq(habits.id, parseInt(id)), eq(habits.userId, decodedToken.uid)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
    }
}
