import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpCodes } from '@/lib/schema';
import { adminAuth } from '@/lib/firebase-admin';
import { eq, and, gt } from 'drizzle-orm';
import { users } from '@/lib/schema';

export async function POST(request: Request) {
    try {
        const { email, otp, newPassword } = await request.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
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

        // 2. Get User ID
        const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (userRecord.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const uid = userRecord[0].id;

        // 3. Update Password in Firebase
        await adminAuth.updateUser(uid, {
            password: newPassword
        });

        // 4. Delete OTP
        await db.delete(otpCodes).where(eq(otpCodes.email, email));

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error: any) {
        console.error('Password Reset Error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
