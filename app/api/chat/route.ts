import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini


export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing in environment variables.");
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set on the server. Please add it to your .env file." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { messages } = body;

        // Basic validation
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Invalid request body: 'messages' must be an array." },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use the flash model for speed and cost-effectiveness
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Format history for Gemini
        // Gemini only supports "user" and "model" roles
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1];
        const prompt = lastMessage.content;

        console.log(`Sending chat to Gemini. History length: ${history.length}`);

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error: any) {
        console.error("Error in chat API:", error);

        // Check for specific Gemini errors
        const errorMessage = error.message || "Internal Server Error";
        let detailedError = errorMessage;

        // If it's a candidate safety error or similar
        if (error.response?.candidates && error.response.candidates.length > 0) {
            const candidate = error.response.candidates[0];
            if (candidate.finishReason && candidate.finishReason !== "STOP") {
                detailedError = `Generation stopped reason: ${candidate.finishReason}`;
            }
        }

        return NextResponse.json(
            { error: detailedError, details: JSON.stringify(error, Object.getOwnPropertyNames(error)) },
            { status: 500 }
        );
    }
}
