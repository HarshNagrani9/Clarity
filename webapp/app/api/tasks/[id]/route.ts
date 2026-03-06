import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            .where(and(eq(tasks.id, parseInt(id)), eq(tasks.userId, decodedToken.uid)))
            .returning();

        if (updatedTask.length === 0) return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
        return NextResponse.json(updatedTask[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        await db.delete(tasks).where(and(eq(tasks.id, parseInt(id)), eq(tasks.userId, decodedToken.uid)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
