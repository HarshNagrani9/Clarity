import "server-only";
import admin from "firebase-admin";

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    // If the key is surrounded by double quotes, remove them
    let cleanKey = key.replace(/^"|"$/g, "");

    // Replace literal "\n" strings (backslash + n) with actual newlines
    if (cleanKey.includes("\\n")) {
        cleanKey = cleanKey.replace(/\\n/g, "\n");
    }

    // Add usage of the private key headers if they are missing
    if (!cleanKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
        cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----\n`;
    }

    return cleanKey;
}

export function createFirebaseAdminApp(params: FirebaseAdminConfig) {
    const privateKey = formatPrivateKey(params.privateKey);

    if (admin.apps.length > 0) {
        return admin.app();
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: params.projectId,
            clientEmail: params.clientEmail,
            privateKey: privateKey,
        }),
    });
}

const params = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!,
};

const app = createFirebaseAdminApp(params);
export const adminAuth = app.auth();
