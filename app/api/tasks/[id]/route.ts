import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedTask = await db
            .update(tasks)
            .set({
                ...body,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                completedAt: body.completed ? new Date() : (body.completed === false ? null : undefined)
            })
            .where(eq(tasks.id, parseInt(id)))
            .returning();
        return NextResponse.json(updatedTask[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await db.delete(tasks).where(eq(tasks.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
