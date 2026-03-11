import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/google/start
 * 
 * Redirects to Google OAuth using authorization code flow.
 * After user signs in, Google redirects to /api/auth/google/callback
 * with a code that we exchange server-side for tokens.
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const clientId = url.searchParams.get('client_id') || '';

    if (!clientId) {
        return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
    }

    // IMPORTANT: Use response_type=code (authorization code flow)
    // Google blocks response_type=id_token for http:// redirect URIs
    const redirectUri = `${url.origin}/api/auth/google/callback`;

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    return NextResponse.redirect(googleAuthUrl.toString());
}
