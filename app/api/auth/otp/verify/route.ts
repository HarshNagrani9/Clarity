import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpCodes, users } from '@/lib/schema';
import { adminAuth } from '@/lib/firebase-admin';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { email, otp, password, name, mobile } = await request.json();

        if (!email || !otp || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify OTP
        const validOTP = await db.select().from(otpCodes).where(
            and(
                eq(otpCodes.email, email),
                eq(otpCodes.code, otp),
                gt(otpCodes.expiresAt, new Date())
            )
        ).limit(1);

        if (validOTP.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // 2. Create User in Firebase
        let uid: string;
        try {
            // Firebase requires E.164 format (e.g. +1234567890)
            // If the user entered a number that doesn't match, we skip adding it to Firebase Auth
            // but we will still save it to our Postgres DB.
            const isE164 = mobile && /^\+[1-9]\d{1,14}$/.test(mobile);

            const userRecord = await adminAuth.createUser({
                email,
                password,
                displayName: name,
                phoneNumber: isE164 ? mobile : undefined,
                emailVerified: true, // We just verified it!
            });
            uid = userRecord.uid;
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            }
            throw error;
        }

        // 3. Create User in Postgres
        await db.insert(users).values({
            id: uid,
            email,
            displayName: name,
            mobile: mobile || null,
        });

        // 4. Delete OTP (prevent reuse)
        await db.delete(otpCodes).where(eq(otpCodes.email, email));

        // 5. Generate Custom Token
        const token = await adminAuth.createCustomToken(uid);

        return NextResponse.json({ token });

    } catch (error: any) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
