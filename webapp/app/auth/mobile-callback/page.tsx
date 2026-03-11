'use client';

import { useEffect } from 'react';

/**
 * This page acts as a bridge for mobile Google OAuth.
 * 
 * Flow:
 * 1. Mobile app opens browser → Google OAuth → redirects here with id_token in URL hash
 * 2. This page reads the id_token from the hash fragment (client-side only)
 * 3. Redirects to clarity://auth?id_token=TOKEN
 * 4. Mobile app's WebBrowser.openAuthSessionAsync catches the clarity:// URL
 * 5. Mobile app signs in to Firebase with the credential
 */
export default function MobileCallbackPage() {
    useEffect(() => {
        // The id_token comes in the URL hash fragment: #id_token=XXX&token_type=Bearer...
        const hash = window.location.hash.substring(1); // remove the leading #
        if (hash) {
            const params = new URLSearchParams(hash);
            const idToken = params.get('id_token');

            if (idToken) {
                // Redirect to the mobile app's custom scheme with the token
                window.location.href = `clarity://auth?id_token=${encodeURIComponent(idToken)}`;
                return;
            }
        }

        // Also check query params (in case of code flow)
        const query = new URLSearchParams(window.location.search);
        const error = query.get('error');
        if (error) {
            window.location.href = `clarity://auth?error=${encodeURIComponent(error)}`;
            return;
        }
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#0f0f0f',
            color: '#a3e635',
            fontFamily: 'monospace',
            fontSize: '18px',
            textAlign: 'center',
            padding: '20px',
        }}>
            <div>
                <p style={{ fontSize: '32px', fontWeight: 900 }}>✓</p>
                <p>Signing you in...</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
                    Redirecting back to Clarity app
                </p>
            </div>
        </div>
    );
}
