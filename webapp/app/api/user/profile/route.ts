import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-verify';
import { adminAuth } from '@/lib/firebase-admin';

export async function PATCH(request: Request) {
    const decodedToken = await verifyAuth();
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { displayName, mobile } = body;
        const uid = decodedToken.uid;

        // 1. Update Postgres
        await db.update(users)
            .set({
                displayName,
                mobile,
                updatedAt: new Date()
            })
            .where(eq(users.id, uid));

        // 2. Update Firebase Auth (optional but good for consistency)
        try {
            await adminAuth.updateUser(uid, {
                displayName,
                // Only update phoneNumber in Firebase if it's a valid E.164
                phoneNumber: (mobile && /^\+[1-9]\d{1,14}$/.test(mobile)) ? mobile : undefined
            });
        } catch (firebaseError) {
            console.error("Firebase Profile Update Warning:", firebaseError);
            // Don't fail the whole request if Firebase update fails (e.g. invalid phone format)
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
