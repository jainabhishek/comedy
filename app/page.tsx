import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Logo/Brand */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4 floating">🎤</div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Tight 5</h2>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Build Your Tightest
          <br />
          Five Minutes
        </h1>

        <p className="mb-10 text-lg text-muted sm:text-xl lg:text-2xl">
          AI-powered comedy writing platform for standup comedians
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/signin">
            <Button size="lg" className="w-full sm:w-auto">
              Start Writing Now
            </Button>
          </Link>
          <Link href="/workshop">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Explore Workshop
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">⚡️</span>
            <h3 className="font-semibold text-foreground">Quick Writing</h3>
            <p className="text-sm text-muted">Generate jokes in seconds</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🎯</span>
            <h3 className="font-semibold text-foreground">Smart Routines</h3>
            <p className="text-sm text-muted">Build perfect 5-minute sets</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📊</span>
            <h3 className="font-semibold text-foreground">Track Performance</h3>
            <p className="text-sm text-muted">Optimize with insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
