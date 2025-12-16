import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { habits } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedHabit = await db
            .update(habits)
            .set(body)
            .where(eq(habits.id, parseInt(id)))
            .returning();
        return NextResponse.json(updatedHabit[0]);
    } catch (error) {
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
