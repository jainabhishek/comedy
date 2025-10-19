"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SignIn() {
  const handleGoogleSignIn = async () => {
    await signIn("google", {
      callbackUrl: "/",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="text-6xl mb-4 floating">🎤</div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Tight 5</h1>
          <p className="text-muted text-lg">AI-Powered Comedy Writing</p>
        </div>

        {/* Sign In Card */}
        <Card className="animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back, Comedian!</CardTitle>
            <CardDescription>Sign in to continue crafting your killer set</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted">
                  Secure authentication
                </span>
              </div>
            </div>

            <div className="text-xs text-muted text-center space-y-1">
              <p>By signing in, you agree to our Terms of Service</p>
              <p>Your data is stored securely and never shared</p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted font-medium">What you&apos;ll get:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
              AI Joke Generation
            </span>
            <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full">
              Routine Builder
            </span>
            <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
              Performance Tracking
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
