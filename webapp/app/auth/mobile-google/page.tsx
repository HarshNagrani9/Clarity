'use client';

import { useEffect, useState, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

/**
 * Mobile Google Sign-In Bridge Page
 * 
 * Uses signInWithPopup (NOT signInWithRedirect) to avoid redirect loops.
 * The user clicks a button, a Google popup opens, they sign in,
 * and then we redirect back to the mobile app with the token.
 */
export default function MobileGoogleSignIn() {
    const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error'>('ready');
    const [errorMsg, setErrorMsg] = useState('');
    const hasStarted = useRef(false);

    const handleGoogleSignIn = async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        setStatus('loading');

        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            const result = await signInWithPopup(auth, provider);

            if (result.user) {
                setStatus('success');

                // Get the Firebase ID token
                const idToken = await result.user.getIdToken();

                // Sign out from the web so it doesn't persist
                await auth.signOut();

                // Redirect back to the mobile app
                window.location.href = `clarity://auth?id_token=${encodeURIComponent(idToken)}`;
            }
        } catch (error: any) {
            console.error('Google Sign-In error:', error);
            hasStarted.current = false;

            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                setStatus('ready');
                setErrorMsg('Popup was blocked. Please tap the button below to try again.');
            } else {
                setStatus('error');
                setErrorMsg(error.message || 'Sign-in failed');

                setTimeout(() => {
                    window.location.href = `clarity://auth?error=${encodeURIComponent(error.message || 'Sign-in failed')}`;
                }, 2000);
            }
        }
    };

    // Auto-start on mount
    useEffect(() => {
        // Small delay to ensure the page is fully rendered
        const timer = setTimeout(() => {
            handleGoogleSignIn();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#0f0f0f',
            color: '#fff',
            fontFamily: 'monospace',
            textAlign: 'center',
            padding: '20px',
        }}>
            <div style={{ maxWidth: '360px', width: '100%' }}>
                {/* Logo */}
                <div style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#a3e635',
                    marginBottom: '32px',
                    letterSpacing: '-1px',
                }}>
                    CLARITY
                </div>

                {status === 'loading' && (
                    <div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid #a3e635',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite',
                        }} />
                        <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                            Signing in with Google...
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <p style={{ fontSize: '32px', marginBottom: '12px' }}>✓</p>
                        <p style={{ color: '#a3e635', fontSize: '16px', fontWeight: 900 }}>
                            Success! Redirecting to app...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
                            {errorMsg}
                        </p>
                        <p style={{ color: '#666', fontSize: '12px' }}>
                            Redirecting back to app...
                        </p>
                    </div>
                )}

                {(status === 'ready' || (status === 'error' && errorMsg.includes('Popup'))) && (
                    <div>
                        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
                            Tap the button below to sign in with your Google account
                        </p>
                        {errorMsg && (
                            <p style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '16px' }}>
                                {errorMsg}
                            </p>
                        )}
                        <button
                            onClick={() => {
                                hasStarted.current = false;
                                handleGoogleSignIn();
                            }}
                            style={{
                                backgroundColor: '#fff',
                                color: '#000',
                                border: '2px solid #000',
                                padding: '14px 32px',
                                fontSize: '16px',
                                fontWeight: 900,
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                width: '100%',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            Sign in with Google
                        </button>
                    </div>
                )}

                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
