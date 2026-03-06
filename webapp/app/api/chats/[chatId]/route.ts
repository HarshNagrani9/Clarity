import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/schema";
import { verifyAuth } from "@/lib/auth-verify";
import { eq, and } from "drizzle-orm";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ chatId: string }> } // Use Promise based params as per Next.js 15+ changes
) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { chatId } = await params;

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        // Verify ownership
        const chat = await db.query.chats.findFirst({
            where: and(eq(chats.id, chatId), eq(chats.userId, auth.uid)),
        });

        if (!chat) {
            return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
        }

        await db.delete(chats).where(eq(chats.id, chatId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }
}
