import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { goals } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        const body = await request.json();
        const updatedGoal = await db
            .update(goals)
            .set({
                ...body,
                targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
            })
            .where(and(eq(goals.id, parseInt(id)), eq(goals.userId, decodedToken.uid)))
            .returning();

        if (updatedGoal.length === 0) return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 });
        return NextResponse.json(updatedGoal[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        const res = await db.delete(goals).where(and(eq(goals.id, parseInt(id)), eq(goals.userId, decodedToken.uid)));
        if (res.rowCount === 0) return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 }); // Optional check depending on driver
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }
}
