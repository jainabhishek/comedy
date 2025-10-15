"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useJokes } from "@/hooks/useJokes";
import { useRoutines } from "@/hooks/useRoutines";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, formatTime } from "@/lib/utils";
import type { Joke } from "@/lib/types";

export default function Dashboard() {
  const { jokes, loading: jokesLoading } = useJokes();
  const { routines, loading: routinesLoading } = useRoutines();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredJokes, setFilteredJokes] = useState<Joke[]>([]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = jokes.filter(
        (joke) =>
          joke.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          joke.setup.toLowerCase().includes(searchQuery.toLowerCase()) ||
          joke.punchline.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJokes(filtered);
    } else {
      setFilteredJokes(jokes);
    }
  }, [searchQuery, jokes]);

  if (jokesLoading || routinesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading your comedy arsenal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">{jokes.length}</CardTitle>
            <CardDescription>Total Jokes</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-secondary">{routines.length}</CardTitle>
            <CardDescription>Routines</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-accent">
              {jokes.filter((j) => j.status === "polished").length}
            </CardTitle>
            <CardDescription>Polished Jokes</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/workshop">
          <Button size="lg">✨ Create New Joke</Button>
        </Link>
        <Link href="/routines">
          <Button size="lg" variant="secondary">
            🎯 View Routines
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search jokes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Jokes Grid */}
        {filteredJokes.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4 floating">🎤</div>
            <h2 className="text-2xl font-bold mb-2">No jokes yet!</h2>
            <p className="text-muted mb-6">
              Start building your comedy arsenal by creating your first joke.
            </p>
            <Link href="/workshop">
              <Button>Create Your First Joke</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJokes.map((joke) => (
              <Link key={joke.id} href={`/editor/${joke.id}`}>
                <Card className="cursor-pointer h-full animate-scale-in">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{joke.title}</CardTitle>
                      <Badge
                        variant={
                          joke.status === "polished"
                            ? "success"
                            : joke.status === "working"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {joke.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {formatDate(joke.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm line-clamp-3">{joke.setup}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {joke.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {joke.energy} energy
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(joke.estimatedTime)}
                      </Badge>
                    </div>
                    {joke.performances.length > 0 && (
                      <p className="text-xs text-muted">
                        {joke.performances.length} performance(s)
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
