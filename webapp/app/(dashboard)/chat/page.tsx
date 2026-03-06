"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { ChatSidebar } from "./_components/chat-sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface Message {
    role: "user" | "model";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { userProfile } = useApp();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch messages when currentChatId changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!user) return;

            try {
                // If no chat ID, clear messages (New Chat state)
                if (!currentChatId) {
                    setMessages([]);
                    return;
                }

                const token = await user.getIdToken();
                const res = await fetch(`/api/chat?chatId=${currentChatId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.messages) {
                    setMessages(data.messages);
                } else {
                    setMessages([]);
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
                toast.error("Failed to load chat history");
            }
        };

        if (user) {
            fetchMessages();
        }
    }, [currentChatId, user]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !user) return;

        const content = input.trim();
        const userMessage: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            const token = await user.getIdToken();
            let chatId = currentChatId;

            // If no chat ID, create a new chat first
            if (!chatId) {
                const createRes = await fetch("/api/chats", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ title: content.slice(0, 30) + (content.length > 30 ? "..." : "") }),
                });

                if (!createRes.ok) throw new Error("Failed to create chat");

                const createData = await createRes.json();
                chatId = createData.chatId;
                setCurrentChatId(chatId);
                setSidebarRefreshTrigger(prev => prev + 1); // Refresh sidebar to show new chat
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage], // Note: messages state might not be updated yet in this closure if relied upon directly, but we are optimistic
                    // Actually, `messages` here is stale? No, it's from render scope. 
                    // But `setMessages` is async. Better to construct the array.
                    // Wait, `messages` in body will be the OLD messages + new one.
                    chatId: chatId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send message");
            }

            setMessages((prev) => [
                ...prev,
                { role: "model", content: data.response },
            ]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to get response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] max-w-6xl mx-auto w-full md:gap-4 md:p-4 p-0">
            {/* Sidebar */}
            <ChatSidebar
                currentChatId={currentChatId}
                onSelectChat={setCurrentChatId}
                className="hidden md:flex w-64 shrink-0 bg-background/50 backdrop-blur rounded-lg border h-full"
                key={sidebarRefreshTrigger} // Force re-render just in case, or pass props
            />

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 h-full w-full gap-4">
                <div className="flex items-center gap-2 p-4 md:p-0 md:pb-2 border-b md:border-0 bg-background md:bg-transparent z-10">
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
                                <SheetTitle>
                                    <div className="sr-only">
                                        <h2 id="sidebar-title">Chat History</h2>
                                    </div>
                                </SheetTitle>
                                <ChatSidebar
                                    currentChatId={currentChatId}
                                    onSelectChat={(id) => {
                                        setCurrentChatId(id);
                                        // Close sheet? The `ChatSidebar` doesn't handle sheet closing.
                                        // We might need a wrapper or just let user tap out.
                                    }}
                                    className="border-none w-full h-full pt-10"
                                    key={sidebarRefreshTrigger}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-semibold">
                        {currentChatId ? "Chat" : "New Chat"}
                    </h1>
                </div>

                <Card className="flex-1 overflow-hidden flex flex-col border-0 shadow-none rounded-none md:border md:shadow-sm md:rounded-lg bg-background/50 backdrop-blur">
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4 p-8 text-center">
                                <Bot className="h-16 w-16" />
                                <p className="text-lg">Start a new conversation</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-3",
                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <Avatar className={cn("h-8 w-8", msg.role === "model" ? "bg-primary/10" : "bg-muted")}>
                                        {msg.role === "user" ? (
                                            <>
                                                <AvatarImage src={user?.photoURL || ""} />
                                                <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                                            </>
                                        ) : (
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        )}
                                    </Avatar>

                                    <div
                                        className={cn(
                                            "rounded-2xl px-5 py-3 max-w-[85%] text-sm shadow-sm",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-muted/80 text-foreground rounded-bl-none backdrop-blur-sm"
                                        )}
                                    >
                                        {msg.role === "model" ? (
                                            <div className="prose dark:prose-invert prose-sm max-w-none break-words">
                                                <Markdown conversation-id={currentChatId}
                                                    components={{
                                                        code({ node, inline, className, children, ...props }: any) {
                                                            return !inline ? (
                                                                <pre className="bg-black/50 p-2 rounded-md my-2 overflow-x-auto text-xs">
                                                                    <code {...props} className={className}>
                                                                        {children}
                                                                    </code>
                                                                </pre>
                                                            ) : (
                                                                <code {...props} className="bg-black/20 rounded px-1">
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </Markdown>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8 bg-primary/10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-background border-t">
                        <div className="flex gap-2 items-end">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                className="min-h-[50px] max-h-[200px] resize-none"
                                rows={1}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="h-[50px] w-[50px] shrink-0"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
