import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function GET(request: Request) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.select().from(users).where(eq(users.id, decodedToken.uid)).limit(1);
        if (!user.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user[0]);
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { preferences } = body;

        if (!preferences) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        // Fetch existing user to merge preferences if needed, or just overwrite/merge at DB level
        // Here we assume preferences is the object to be set/merged

        // Simple update for now
        await db.update(users)
            .set({ preferences: preferences, updatedAt: new Date() })
            .where(eq(users.id, decodedToken.uid));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile PATCH error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
