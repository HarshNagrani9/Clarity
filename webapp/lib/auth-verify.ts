import { adminAuth } from "./firebase-admin";
import { headers } from "next/headers";

export async function verifyAuth() {
    const headersList = await headers();
    const token = headersList.get("authorization")?.split("Bearer ")[1];

    if (!token) {
        return null;
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Auth verification failed:", error);
        return null;
    }
}
