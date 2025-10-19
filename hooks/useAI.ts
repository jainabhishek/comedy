import { useState, useCallback } from "react";
import type {
  Joke,
  Performance,
  WeaknessReport,
  FlowAnalysis,
  PlacementSuggestion,
  PerformanceInsights,
  JokeImprovement,
  RoutineJokeSummary,
  SelectedPartOption,
} from "@/lib/types";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPartId, setLoadingPartId] = useState<string | null>(null);

  const generatePartOptions = useCallback(
    async (params: {
      structureId: string;
      partId: string;
      premise: string;
      priorSelections: SelectedPartOption[];
    }): Promise<{ suggestions: string[]; source?: string }> => {
      setLoading(true);
      setLoadingPartId(params.partId);
      setError(null);

      try {
        const response = await fetch("/api/joke/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "structure-part",
            structureId: params.structureId,
            partId: params.partId,
            premise: params.premise,
            priorSelections: params.priorSelections,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          const reason = typeof error.detail === "string" ? ` (${error.detail})` : "";
          throw new Error(error.error ? `${error.error}${reason}` : "Failed to generate options");
        }

        const data: { suggestions: string[]; source?: string } = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
        setLoadingPartId(null);
      }
    },
    []
  );

  // Improve joke
  const improveJoke = useCallback(
    async (
      setup: string,
      punchline: string,
      direction: string
    ): Promise<JokeImprovement> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/joke/improve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup, punchline, direction }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to improve joke");
        }

        const data: JokeImprovement = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Analyze joke
  const analyzeJoke = useCallback(
    async (setup: string, punchline: string, tags: string[]): Promise<WeaknessReport> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/joke/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup, punchline, tags }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to analyze joke");
        }

        const data: WeaknessReport = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Generate tag suggestions
  const suggestTags = useCallback(async (setup: string, punchline: string): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/joke/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup, punchline, requestTags: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to suggest tags");
      }

      const data: string[] = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze routine
  const analyzeRoutine = useCallback(async (jokes: RoutineJokeSummary[]): Promise<FlowAnalysis> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/routine/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jokes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze routine");
      }

      const data: FlowAnalysis = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimize routine
  const optimizeRoutine = useCallback(
    async (jokes: RoutineJokeSummary[]): Promise<{ optimizedOrder: string[]; reasoning: string }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/routine/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jokes }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to optimize routine");
        }

        const data: { optimizedOrder: string[]; reasoning: string } = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Suggest placement for new joke
  const suggestPlacement = useCallback(
    async (
      newJoke: RoutineJokeSummary,
      existingJokes: RoutineJokeSummary[]
    ): Promise<{ suggestions: PlacementSuggestion[] }> => {
      setLoading(true);
      setError(null);

      try {
        const newJokeData = {
          title: newJoke.title,
          energy: newJoke.energy,
          type: newJoke.type,
        };

        const existingJokesData = existingJokes.map((joke) => ({
          title: joke.title,
          energy: joke.energy,
          type: joke.type,
        }));

        const response = await fetch("/api/routine/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jokes: existingJokesData,
            newJoke: newJokeData,
            requestPlacement: true,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to suggest placement");
        }

        const data: { suggestions: PlacementSuggestion[] } = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Analyze performances
  const analyzePerformances = useCallback(
    async (performances: Performance[], jokes: Joke[]): Promise<PerformanceInsights> => {
      setLoading(true);
      setError(null);

      try {
        const performanceData = performances.map((p) => {
          const joke = jokes.find((j) => j.id === p.jokeId);
          return {
            date: p.date,
            outcome: p.outcome,
            actualTime: p.actualTime,
            jokeTitle: joke?.title || "Unknown",
          };
        });

        const response = await fetch("/api/performance/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ performances: performanceData }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to analyze performances");
        }

        const data: PerformanceInsights = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    loadingPartId,
    generatePartOptions,
    improveJoke,
    analyzeJoke,
    suggestTags,
    analyzeRoutine,
    optimizeRoutine,
    suggestPlacement,
    analyzePerformances,
  };
}
