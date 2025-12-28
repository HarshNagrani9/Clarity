"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CheckCircle, Target, Calendar, ListTodo, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/habits", label: "Habits", icon: CheckCircle },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    { href: "/calendar", label: "Calendar", icon: Calendar },
];

export function Sidebar({ className, onNavClick }: { className?: string; onNavClick?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
            onNavClick?.();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className={cn("flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground", className)}>
            <div className="flex h-16 items-center px-6">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Clarity</h1>
            </div>

            <div className="flex-1 overflow-auto py-6 px-4">
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Button
                                key={item.href}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 pl-4",
                                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                                )}
                                asChild
                            >
                                <Link href={item.href} onClick={onNavClick}>
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-sidebar-border">
                <div className="mb-4 px-2">
                    <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium truncate" title={user?.email || ""}>
                        {user?.email || "Guest"}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Log Out
                </Button>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                    v0.1.0
                </div>
            </div>
        </div>
    );
}
