import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits, habitCompletions } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { toggleDate, userId, ...updateData } = body;

        // Analytics: Handle separate normalized table
        if (toggleDate && userId) {
            const habitId = parseInt(id);

            // Check if already completed
            const existing = await db.select().from(habitCompletions).where(
                and(
                    eq(habitCompletions.habitId, habitId),
                    eq(habitCompletions.date, toggleDate)
                )
            );

            if (existing.length > 0) {
                // If exists, remove it (Uncheck)
                await db.delete(habitCompletions).where(
                    and(
                        eq(habitCompletions.habitId, habitId),
                        eq(habitCompletions.date, toggleDate)
                    )
                );
            } else {
                // If not exists, insert it (Check)
                await db.insert(habitCompletions).values({
                    habitId,
                    userId,
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
            .where(eq(habits.id, parseInt(id)))
            .returning();

        return NextResponse.json(updatedHabit[0]);
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await db.delete(habits).where(eq(habits.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
    }
}
