"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "Unable to sign in. Please try again.",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold text-primary mb-2">Oops!</h1>
        </div>

        <Card className="animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted text-center">
              <p>This could be because:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>Your session expired</li>
                <li>The authentication link was already used</li>
                <li>There&apos;s a temporary server issue</li>
              </ul>
            </div>

            <Link href="/auth/signin" className="block">
              <Button className="w-full" size="lg">
                Try Again
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="secondary" className="w-full">
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-muted">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
