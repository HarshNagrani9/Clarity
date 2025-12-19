import { initAdmin } from "./firebase-admin";
import { headers } from "next/headers";

export async function verifyAuth() {
    const headersList = await headers();
    const token = headersList.get("authorization")?.split("Bearer ")[1];

    if (!token) {
        return null;
    }

    try {
        const admin = await initAdmin();
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Auth verification failed:", error);
        return null;
    }
}
