"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";

import { useApp } from "@/lib/store";

export function Header() {
    const { userProfile } = useApp();
    const displayName = userProfile?.displayName || "User Name";
    const email = userProfile?.email || "user@example.com";
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
        <header className="flex h-16 items-center justify-between border-b px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4 w-1/3">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r border-[#333] bg-[#0f0f0f] w-[300px]">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <Sidebar className="border-none w-full" />
                    </SheetContent>
                </Sheet>

                <div className="relative w-full max-w-xs hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-9 h-9 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:ring-primary/20"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
                </Button>

                <div className="flex items-center gap-3 pl-4 border-l">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{email}</p>
                    </div>
                    <Avatar className="h-9 w-9 border-2 border-primary/10 cursor-pointer hover:border-primary/50 transition-colors">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
