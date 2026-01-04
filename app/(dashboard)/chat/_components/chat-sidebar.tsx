"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, MessageSquare, Trash2, Menu, MoreVertical, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Chat {
    id: string;
    title: string;
    updatedAt: string;
}

interface ChatSidebarProps {
    currentChatId: string | null;
    onSelectChat: (chatId: string | null) => void;
    className?: string;
}

export function ChatSidebar({ currentChatId, onSelectChat, className }: ChatSidebarProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchChats(currentUser);
            } else {
                setChats([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchChats = async (currentUser: any) => {
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch("/api/chats", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.chats) {
                setChats(data.chats);
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        }
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/chats/${chatId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setChats((prev) => prev.filter((c) => c.id !== chatId));
                if (currentChatId === chatId) {
                    onSelectChat(null);
                }
                toast.success("Chat deleted");
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete chat");
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
            <div className="p-4 border-b">
                <Button
                    onClick={() => onSelectChat(null)}
                    className="w-full justify-center gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                    <MessageSquarePlus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {chats.length === 0 ? (
                        <div className="text-center py-8 px-4 text-muted-foreground space-y-2">
                            <MessageSquare className="h-8 w-8 mx-auto opacity-20" />
                            <p className="text-sm">No chat history yet.</p>
                            <p className="text-xs opacity-70">Start a new conversation to begin.</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent",
                                    currentChatId === chat.id
                                        ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border/50"
                                )}
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <MessageSquare className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    currentChatId === chat.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                <span className="truncate flex-1 text-left">{chat.title}</span>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus:opacity-100"
                                            >
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                onClick={(e) => handleDeleteChat(e as any, chat.id)} // casting because DropdownMenuItem onClick event type mismatch slightly
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {user && (
                <div className="p-4 border-t bg-muted/30">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                            <AvatarImage src={user.photoURL || ""} />
                            <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
