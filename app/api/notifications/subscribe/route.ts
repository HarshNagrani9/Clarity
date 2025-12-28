import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/schema';
import { verifyAuth } from '@/lib/auth-verify';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subscription } = await request.json();

        // Ensure subscription object is valid
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        // Check if already exists
        const existing = await db.select().from(pushSubscriptions).where(
            eq(pushSubscriptions.endpoint, subscription.endpoint)
        ).limit(1);

        if (existing.length === 0) {
            await db.insert(pushSubscriptions).values({
                userId: decodedToken.uid,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push Subscribe Error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { endpoint } = await request.json();
        if (!endpoint) return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });

        await db.delete(pushSubscriptions).where(
            and(
                eq(pushSubscriptions.userId, decodedToken.uid),
                eq(pushSubscriptions.endpoint, endpoint)
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push Unsubscribe Error:', error);
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }
}
