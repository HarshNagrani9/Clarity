import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = parseInt((await params).id);
        await db.delete(events).where(eq(events.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
