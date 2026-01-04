import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/schema";
import { verifyAuth } from "@/lib/auth-verify";
import { eq, asc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userMessages = await db
            .select()
            .from(messagesTable)
            .where(eq(messagesTable.userId, auth.uid))
            .orderBy(asc(messagesTable.createdAt));

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
        const { messages, newMessage } = body;
        // We expect `newMessage` to be the latest user input { role: 'user', content: '...' }
        // OR we can just use the last message from `messages` array if the frontend sends it all.
        // Let's stick to the existing implicit contract: `messages` is the full array including the new one.
        // But for persistence, we need to know exactly what to save.
        // Let's optimize: Frontend sends the new user message. We save it. Then we get AI response. We save it.
        // BUT, for context, we need previous messages.
        // Let's assume `messages` contains the FULL history including the new user message at the end.

        // Actually, to ensure consistency, let's look at the last message in `messages` array.
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            return NextResponse.json({ error: "Invalid request: Last message must be from user" }, { status: 400 });
        }

        // Save user message to DB
        await db.insert(messagesTable).values({
            userId: auth.uid,
            role: "user",
            content: lastMessage.content,
        });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Format history for Gemini
        // We can either trust the frontend's `messages` OR fetch from DB.
        // Fetching from DB is safer and ensures single source of truth, but `messages` payload is already there.
        // Let's use the DB history to be robust.
        const history = await db
            .select()
            .from(messagesTable)
            .where(eq(messagesTable.userId, auth.uid))
            .orderBy(asc(messagesTable.createdAt));

        // Gemini history format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
        // The last message we just saved is in `history` now? No, `messages` array from frontend has it.
        // But we inserted it above. So fetching DB should have it.
        // Exception: replication lag? Unlikely with simple await.

        // Let's construct history from DB, excluding the very last one which is the prompt.
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
            role: "model",
            content: text,
        });

        return NextResponse.json({ response: text });
    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
