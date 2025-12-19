import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Sign Up - Clarity",
    description: "Create an account",
};

import { AuthVisual } from "@/components/auth/auth-visual";

export default function SignupPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <AuthVisual />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Zap className="mr-2 h-6 w-6 text-lime-400 fill-current" />
                    Clarity
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;I stopped paying for 5 different apps. Clarity does it all with style.&rdquo;
                        </p>
                        <footer className="text-sm">Alex Chen</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8 relative px-8">
                {/* Mobile Decoration */}
                <div className="absolute top-0 left-0 w-full h-full lg:hidden -z-10 opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-400/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
                </div>

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden justify-center items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-lime-400 border border-black rounded flex items-center justify-center">
                                <Zap className="w-5 h-5 text-black fill-current" />
                            </div>
                            <span className="text-xl font-black tracking-tighter italic">CLARITY</span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>
                    <AuthForm mode="signup" />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

