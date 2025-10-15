import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "AI Writing Coach",
    description:
      "Brainstorm, punch up, and iterate on material with workflows tuned for standup comedians.",
    highlight: "Powered by conversational prompt chains that understand comedic structure.",
  },
  {
    title: "Routine Builder",
    description:
      "Drag jokes into sets, reorder beats, and keep your timing tight with automatic runtime calculations.",
    highlight: "Stay stage-ready with crowd-tested polish tracking and performance history.",
  },
  {
    title: "Showtime Analytics",
    description:
      "Collect feedback after every mic, spot trends, and watch your laugh-per-minute climb.",
    highlight: "Visual dashboards surface energy, pacing, and resilience at a glance.",
  },
];

const workflow = [
  {
    step: "Ideate",
    title: "Start with a spark",
    description:
      "Drop a premise, riff with the AI writing partner, and capture multiple angles before the thought fades.",
  },
  {
    step: "Refine",
    title: "Tighten the punch",
    description:
      "Score setups and punchlines for rhythm, escalate stakes, and keep callbacks consistent across your set.",
  },
  {
    step: "Perform",
    title: "Bring it to the room",
    description:
      "Log performances, note crowd reactions, and let AI highlight what landed, what needs love, and why.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[32px] border border-glass-border bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 p-10 shadow-glass-xl dark:from-[#121826] dark:via-[#1a1f2e] dark:to-[#291f2f]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/40 blur-3xl dark:bg-white/5" />
        <div className="absolute -bottom-12 left-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl dark:bg-secondary/30" />

        <div className="relative grid gap-12 lg:grid-cols-[3fr,2fr] lg:items-center">
          <div className="space-y-8">
            <Badge variant="glass" className="w-fit text-sm uppercase tracking-[0.2em]">
              AI-Powered Comedy Suite
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Build your tightest five with an AI partner that knows the room.
              </h1>
              <p className="text-lg text-muted sm:text-xl">
                Tight 5 keeps your ideas flowing, your timing sharp, and your performances evolving—so when the light hits, you already own the stage.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/auth/signin" className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Start Writing Now
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline-glass" className="w-full">
                  Explore the App
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡️</span>
                <span>Guided joke workflows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span>Routine pacing insights</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span>Performance analytics</span>
              </div>
            </div>
          </div>

          <Card className="relative overflow-hidden border-0 bg-white/70 p-0 shadow-glass-xl dark:bg-surface-higher/80">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,122,255,0.12),transparent)]" />
            <CardHeader className="relative space-y-2">
              <CardTitle className="text-2xl font-semibold">Tonight&apos;s Spotlight Routine</CardTitle>
              <CardDescription>See every beat breathe before you hit the mic.</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="glass rounded-xl p-4 shadow-glass">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">Crowd Work Opener</p>
                  <Badge variant="success">Polished</Badge>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Test the room with a quick location riff, then twist into a personal callback.
                </p>
              </div>
              <div className="glass rounded-xl p-4 shadow-glass">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">Dating App Spiral</p>
                  <Badge variant="warning">Working</Badge>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Layer escalating stakes, land the absurd visual, and tag it with a hot take.
                </p>
              </div>
              <div className="glass rounded-xl p-4 shadow-glass">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">Family Group Chat</p>
                  <Badge variant="outline">Draft</Badge>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Align the climax with the opener for a clean callback and stronger closer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="glass" className="w-fit text-xs uppercase tracking-[0.3em]">
              Features
            </Badge>
            <h2 className="text-3xl font-semibold sm:text-4xl">Everything you need to craft and test a killer set.</h2>
            <p className="text-muted sm:text-lg">
              We built Tight 5 with working comics, show producers, and punch-up writers to keep the creative momentum alive.
            </p>
          </div>
          <Link href="/workshop">
            <Button variant="outline">See the Workshop</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full border border-glass-border/60">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-semibold text-primary">{feature.title}</CardTitle>
                <CardDescription className="text-base text-foreground/80">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted">
                {feature.highlight}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="border border-glass-border/70">
          <CardHeader className="space-y-3">
            <Badge variant="glass" className="w-fit text-xs uppercase tracking-[0.3em]">
              How it works
            </Badge>
            <CardTitle className="text-3xl">A workflow that mirrors the way you actually write.</CardTitle>
            <CardDescription className="text-base text-foreground/80">
              Move from initial spark to polished routine without losing context. Every step compounds your momentum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {workflow.map((item) => (
              <div key={item.step} className="rounded-2xl border border-glass-border/60 bg-white/60 p-6 shadow-glass dark:bg-surface-elevated/80">
                <Badge variant="outline" className="mb-3 w-fit text-xs">{item.step}</Badge>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="overflow-hidden rounded-3xl border border-glass-border bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-12 text-center shadow-glass-xl dark:from-primary/20 dark:via-secondary/20 dark:to-accent/20">
        <div className="mx-auto max-w-3xl space-y-6">
          <Badge variant="glass" className="mx-auto w-fit text-xs uppercase tracking-[0.3em]">
            Ready to riff?
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">Tighten your next five minutes in half the time.</h2>
          <p className="text-base text-muted sm:text-lg">
            Jump in, experiment with new angles, and never lose a punchline again. When you&apos;re on stage, every beat will feel rehearsed, alive, and ready.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/signin" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Get Started Free
              </Button>
            </Link>
            <Link href="/workshop" className="w-full sm:w-auto">
              <Button size="lg" variant="outline-glass" className="w-full">
                Try the Writing Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
