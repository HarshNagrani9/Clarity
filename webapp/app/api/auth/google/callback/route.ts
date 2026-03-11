import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * GET /api/auth/google/callback
 * 
 * Receives the authorization code from Google, exchanges it for tokens,
 * creates/gets the Firebase user, generates a custom token,
 * and redirects to the mobile app with clarity://auth?token=XXX
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`clarity://auth?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
        return NextResponse.redirect(`clarity://auth?error=${encodeURIComponent('No authorization code received')}`);
    }

    try {
        const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID || '';
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
        const redirectUri = `${url.origin}/api/auth/google/callback`;

        if (!clientSecret) {
            return NextResponse.redirect(
                `clarity://auth?error=${encodeURIComponent('Server missing GOOGLE_CLIENT_SECRET in .env')}`
            );
        }

        // Exchange the authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('[google/callback] Token exchange error:', tokenData);
            return NextResponse.redirect(
                `clarity://auth?error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`
            );
        }

        const { id_token } = tokenData;

        if (!id_token) {
            return NextResponse.redirect(
                `clarity://auth?error=${encodeURIComponent('No ID token in Google response')}`
            );
        }

        // Verify the Google ID token and get user info
        const ticket = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
        const userInfo = await ticket.json();

        if (!userInfo.email) {
            return NextResponse.redirect(
                `clarity://auth?error=${encodeURIComponent('Could not get user email from Google')}`
            );
        }

        // Create or get the Firebase user
        let firebaseUser;
        try {
            firebaseUser = await adminAuth.getUserByEmail(userInfo.email);
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                // Create a new Firebase user
                firebaseUser = await adminAuth.createUser({
                    email: userInfo.email,
                    displayName: userInfo.name || userInfo.email.split('@')[0],
                    photoURL: userInfo.picture || undefined,
                    emailVerified: true,
                });
            } else {
                throw e;
            }
        }

        // Create a custom token for the mobile app
        const customToken = await adminAuth.createCustomToken(firebaseUser.uid);

        // Redirect to the mobile app with the custom token
        return NextResponse.redirect(`clarity://auth?token=${encodeURIComponent(customToken)}`);

    } catch (err: any) {
        console.error('[google/callback] Error:', err);
        return NextResponse.redirect(
            `clarity://auth?error=${encodeURIComponent(err.message || 'Authentication failed')}`
        );
    }
}
