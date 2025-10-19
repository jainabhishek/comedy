"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRoutinesQuery } from "@/hooks/useRoutinesQuery";
import { useJokesQuery } from "@/hooks/useJokesQuery";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function RoutinesPage() {
  const router = useRouter();
  const { routines, createRoutine, loading: routinesLoading } = useRoutinesQuery();
  const { jokes, loading: jokesLoading } = useJokesQuery();

  if (routinesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading routines...</p>
        </div>
      </div>
    );
  }

  const getRoutineTime = (jokeIds: string[]) => {
    return jokeIds.reduce((total, id) => {
      const joke = jokes.find((j) => j.id === id);
      return total + (joke?.estimatedTime || 0);
    }, 0);
  };

  const handleCreateRoutine = () => {
    const name = prompt("Enter routine name:", "New Routine");
    if (name) {
      const routine = createRoutine({
        name,
        jokeIds: [],
        targetTime: 300,
        currentTime: 0,
      });
      router.push(`/routine/${routine.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Routines 🎯</h1>
          <p className="text-muted">Build and manage your 5-minute sets</p>
        </div>
        <Button onClick={handleCreateRoutine}>+ New Routine</Button>
      </div>

      {routines.length === 0 ? (
        <Card className="p-12 text-center animate-scale-in">
          <div className="text-6xl mb-4 floating">🎯</div>
          <h2 className="text-2xl font-bold mb-2">No routines yet!</h2>
          <p className="text-muted mb-6">
            Create your first routine to organize your jokes into a tight 5-minute set.
          </p>
          <Button onClick={handleCreateRoutine}>Create Your First Routine</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine) => {
            const totalTime = getRoutineTime(routine.jokeIds);
            const isOverTime = totalTime > routine.targetTime;

            return (
              <Link key={routine.id} href={`/routine/${routine.id}`}>
                <Card className="cursor-pointer h-full animate-scale-in">
                  <CardHeader>
                    <CardTitle className="text-lg">{routine.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatDate(routine.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Jokes:</span>
                      <Badge variant="glass">{routine.jokeIds.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Total Time:</span>
                      <Badge variant={isOverTime ? "error" : "success"}>
                        {formatTime(totalTime)} / {formatTime(routine.targetTime)}
                      </Badge>
                    </div>
                    {routine.flowScore !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Flow Score:</span>
                        <Badge variant={routine.flowScore > 70 ? "success" : "warning"}>
                          {routine.flowScore}/100
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
