"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithCustomToken, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AuthFormProps {
    mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Sync to DB
            const token = await user.getIdToken();
            await fetch('/api/users/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    mobile: user.phoneNumber || null // Google doesn't always provide this
                })
            });

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Google login error:", err);
            setError(err.message || "Failed to sign in with Google.");
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === "signup") {
                if (!otpSent) {
                    // Step 1: Send OTP
                    const res = await fetch('/api/auth/otp/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to send OTP");

                    setOtpSent(true);
                    toast.success("OTP sent to your email!");
                } else {
                    // Step 2: Verify OTP and Create User
                    const res = await fetch('/api/auth/otp/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, otp, password, name, mobile })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to verify OTP");

                    // Step 3: Sign in with Custom Token
                    await setPersistence(auth, browserLocalPersistence);
                    await signInWithCustomToken(auth, data.token);

                    router.push("/dashboard");
                    toast.success("Account created successfully!");
                }
            } else {
                await setPersistence(auth, browserLocalPersistence);
                await signInWithEmailAndPassword(auth, email, password);
                router.push("/dashboard");
            }
        } catch (err: any) {
            // Only log actual system errors, not validation errors
            if (err.message !== "Invalid or expired OTP" && err.message !== "User already exists") {
                console.error("Auth Error:", err);
            }
            const message = err.message || "An error occurred during authentication.";
            setError(message);
            toast.error(message);
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
                                    disabled={loading || googleLoading}
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
                                    disabled={loading || googleLoading}
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
                            disabled={loading || googleLoading}
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
                            disabled={loading || googleLoading || otpSent}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {otpSent && (
                        <div className="grid gap-2">
                            <Label htmlFor="otp" className="uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground/70 mb-1.5">Verification Code</Label>
                            <Input
                                id="otp"
                                placeholder="123456"
                                type="text"
                                className="h-10 bg-secondary/50 border-transparent focus:border-lime-400/50 focus:ring-lime-400/20 placeholder:text-muted-foreground/40 tracking-widest text-center"
                                disabled={loading}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                            />
                        </div>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button disabled={loading || googleLoading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "signin" ? "Sign In" : (otpSent ? "Verify & Create Account" : "Sign Up")}
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
            <Button variant="outline" type="button" disabled={loading || googleLoading} onClick={handleGoogleLogin}>
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                )}
                Google
            </Button>
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

