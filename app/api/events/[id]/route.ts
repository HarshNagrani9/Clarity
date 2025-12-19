import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const id = parseInt((await params).id);
        await db.delete(events).where(and(eq(events.id, id), eq(events.userId, decodedToken.uid)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
