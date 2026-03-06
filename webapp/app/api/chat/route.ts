import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages as messagesTable, chats as chatsTable } from "@/lib/schema";
import { verifyAuth } from "@/lib/auth-verify";
import { eq, asc, and } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get("chatId");

        let userMessages;
        if (chatId) {
            userMessages = await db
                .select()
                .from(messagesTable)
                .where(and(eq(messagesTable.userId, auth.uid), eq(messagesTable.chatId, chatId)))
                .orderBy(asc(messagesTable.createdAt));
        } else {
            return NextResponse.json({ messages: [] });
        }

        return NextResponse.json({ messages: userMessages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set on the server." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { messages, chatId } = body;

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            return NextResponse.json({ error: "Invalid request: Last message must be from user" }, { status: 400 });
        }

        // Save user message to DB
        await db.insert(messagesTable).values({
            userId: auth.uid,
            chatId: chatId,
            role: "user",
            content: lastMessage.content,
        });

        // Update chat updated_at
        await db.update(chatsTable)
            .set({ updatedAt: new Date() })
            .where(eq(chatsTable.id, chatId));

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Fetch history for this specific chat
        const history = await db
            .select()
            .from(messagesTable)
            .where(and(eq(messagesTable.userId, auth.uid), eq(messagesTable.chatId, chatId)))
            .orderBy(asc(messagesTable.createdAt));

        const geminiHistory = history.slice(0, -1).map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const prompt = lastMessage.content;

        const chat = model.startChat({
            history: geminiHistory,
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        // Save AI response to DB
        await db.insert(messagesTable).values({
            userId: auth.uid,
            chatId: chatId,
            role: "model",
            content: text,
        });

        // Update chat updated_at again? Optional but good for freshness
        await db.update(chatsTable)
            .set({ updatedAt: new Date() })
            .where(eq(chatsTable.id, chatId));

        return NextResponse.json({ response: text });
    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
