import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';

export async function POST(request: Request) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { uid, email, displayName, mobile } = body;

        // Security check: Ensure the authenticated user is syncing their OWN data
        if (uid !== decodedToken.uid) {
            return NextResponse.json({ error: 'Forbidden: UID mismatch' }, { status: 403 });
        }

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.id, uid)).limit(1);

        if (existingUser.length > 0) {
            // Update
            const updates: any = { email, updatedAt: new Date() };
            if (displayName) updates.displayName = displayName;
            if (mobile) updates.mobile = mobile;

            await db.update(users)
                .set(updates)
                .where(eq(users.id, uid));
        } else {
            // Insert
            await db.insert(users).values({
                id: uid,
                email,
                displayName: displayName || email.split('@')[0], // Fallback
                mobile: mobile || null,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("User sync error:", error);
        return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }
}
