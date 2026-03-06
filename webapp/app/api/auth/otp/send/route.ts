import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpCodes, users } from '@/lib/schema';
import { sendOTPEmail } from '@/lib/mail';
import { eq } from 'drizzle-orm';
import { randomInt } from 'crypto';
import { addMinutes } from 'date-fns';

export async function POST(request: Request) {
    try {
        const { email, type } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        // If it's a signup (default), user shouldn't exist
        if (!type || type === 'SIGNUP') {
            if (existingUser.length > 0) {
                return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            }
        }
        // If it's a reset, user MUST exist
        else if (type === 'RESET_PASSWORD') {
            if (existingUser.length === 0) {
                return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
            }
        }

        // Generate 6-digit OTP
        const code = randomInt(100000, 999999).toString();
        const expiresAt = addMinutes(new Date(), 10);

        // Store in DB
        // Optionally delete old OTPs for this email first
        await db.delete(otpCodes).where(eq(otpCodes.email, email));

        await db.insert(otpCodes).values({
            email,
            code,
            expiresAt,
        });

        // Send Email
        await sendOTPEmail(email, code);

        return NextResponse.json({ success: true, message: 'OTP sent' });

    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
