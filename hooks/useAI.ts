import { useState, useCallback } from "react";
import type {
  Joke,
  Routine,
  Performance,
  WeaknessReport,
  FlowAnalysis,
  PlacementSuggestion,
  PerformanceInsights,
} from "@/lib/types";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate setups from premise
  const generateSetups = useCallback(async (premise: string): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/joke/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "setup", content: premise }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate setups");
      }

      const data = await response.json();
      return data.suggestions;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate punchlines from setup
  const generatePunchlines = useCallback(async (setup: string): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/joke/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "punchline", content: setup }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate punchlines");
      }

      const data = await response.json();
      return data.suggestions;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Improve joke
  const improveJoke = useCallback(
    async (
      setup: string,
      punchline: string,
      direction: string
    ): Promise<{ setup: string; punchline: string; explanation: string }> => {
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

        const data = await response.json();
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

        const data = await response.json();
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

      const data = await response.json();
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
  const analyzeRoutine = useCallback(async (routine: Routine, jokes: Joke[]): Promise<FlowAnalysis> => {
    setLoading(true);
    setError(null);

    try {
      const jokesData = jokes.map((j) => ({
        id: j.id,
        title: j.title,
        energy: j.energy,
        type: j.type,
        estimatedTime: j.estimatedTime,
      }));

      const response = await fetch("/api/routine/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jokes: jokesData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze routine");
      }

      const data = await response.json();
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
    async (jokes: Joke[]): Promise<{ optimizedOrder: string[]; reasoning: string }> => {
      setLoading(true);
      setError(null);

      try {
        const jokesData = jokes.map((j) => ({
          id: j.id,
          title: j.title,
          energy: j.energy,
          type: j.type,
          estimatedTime: j.estimatedTime,
        }));

        const response = await fetch("/api/routine/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jokes: jokesData }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to optimize routine");
        }

        const data = await response.json();
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
    async (newJoke: Joke, existingJokes: Joke[]): Promise<{ suggestions: PlacementSuggestion[] }> => {
      setLoading(true);
      setError(null);

      try {
        const newJokeData = {
          title: newJoke.title,
          energy: newJoke.energy,
          type: newJoke.type,
        };

        const existingJokesData = existingJokes.map((j) => ({
          title: j.title,
          energy: j.energy,
          type: j.type,
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

        const data = await response.json();
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

        const data = await response.json();
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
    generateSetups,
    generatePunchlines,
    improveJoke,
    analyzeJoke,
    suggestTags,
    analyzeRoutine,
    optimizeRoutine,
    suggestPlacement,
    analyzePerformances,
  };
}
