import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/auth/exchange-token
 * 
 * Receives a Firebase ID token from the mobile app's Google Sign-In bridge,
 * verifies it, and returns a custom token that the mobile app can use
 * to sign in with signInWithCustomToken.
 */
export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
        }

        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Create a custom token for this user
        const customToken = await adminAuth.createCustomToken(uid);

        return NextResponse.json({ customToken });
    } catch (error: any) {
        console.error("[exchange-token] Error:", error);
        return NextResponse.json(
            { error: error.message || "Token exchange failed" },
            { status: 401 }
        );
    }
}
