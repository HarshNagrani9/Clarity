import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedGoal = await db
            .update(goals)
            .set({
                ...body,
                targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
            })
            .where(eq(goals.id, parseInt(id)))
            .returning();
        return NextResponse.json(updatedGoal[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await db.delete(goals).where(eq(goals.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }
}
