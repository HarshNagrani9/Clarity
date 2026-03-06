import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/schema";
import { verifyAuth } from "@/lib/auth-verify";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userChats = await db
            .select()
            .from(chats)
            .where(eq(chats.userId, auth.uid))
            .orderBy(desc(chats.updatedAt));

        return NextResponse.json({ chats: userChats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title } = body;

        const newChatId = crypto.randomUUID();

        await db.insert(chats).values({
            id: newChatId,
            userId: auth.uid,
            title: title || "New Chat",
        });

        return NextResponse.json({ chatId: newChatId });
    } catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
    }
}
