"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
    mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === "signup") {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Update Firebase Profile
                // Note: We need to dynamically import updateProfile or standard import if firebase/auth allows 
                // But the 'auth' object is from context/lib. We should import { updateProfile } from "firebase/auth"
                const { updateProfile } = await import("firebase/auth");
                await updateProfile(userCredential.user, {
                    displayName: name
                });

                // Sync to DB
                await fetch('/api/users/sync', {
                    method: 'POST',
                    body: JSON.stringify({
                        uid: userCredential.user.uid,
                        email,
                        displayName: name,
                        mobile
                    })
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                // Sync happens in store onAuthStateChanged, but getting mobile might be tricky there if not in profile.
            }
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    {mode === "signup" && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground/70 mb-1.5">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    type="text"
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    className="h-10 bg-secondary/50 border-transparent focus:border-lime-400/50 focus:ring-lime-400/20 placeholder:text-muted-foreground/40"
                                    disabled={loading}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="mobile" className="uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground/70 mb-1.5">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    placeholder="+1234567890"
                                    type="tel"
                                    autoComplete="tel"
                                    className="h-10 bg-secondary/50 border-transparent focus:border-lime-400/50 focus:ring-lime-400/20 placeholder:text-muted-foreground/40"
                                    disabled={loading}
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground/70 mb-1.5">Email</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            className="h-10 bg-secondary/50 border-transparent focus:border-lime-400/50 focus:ring-lime-400/20 placeholder:text-muted-foreground/40"
                            disabled={loading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground/70 mb-1.5">Password</Label>
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            autoCapitalize="none"
                            autoComplete={mode === "signup" ? "new-password" : "current-password"}
                            className="h-10 bg-secondary/50 border-transparent focus:border-lime-400/50 focus:ring-lime-400/20 placeholder:text-muted-foreground/40"
                            disabled={loading}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "signin" ? "Sign In" : "Sign Up"}
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <div className="text-center text-sm">
                {mode === "signin" ? (
                    <>
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                            Sign Up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                            Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
