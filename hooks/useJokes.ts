import { useState, useEffect, useCallback } from "react";
import type { Joke, JokeVersion, JokeFilters, JokeSortOption } from "@/lib/types";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/utils";

export function useJokes() {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);

  // Load jokes from storage on mount
  useEffect(() => {
    const loadJokes = () => {
      const allJokes = storage.getAllJokes();
      setJokes(allJokes);
      setLoading(false);
    };

    loadJokes();
  }, []);

  // Create new joke
  const createJoke = useCallback((jokeData: Omit<Joke, "id" | "createdAt" | "updatedAt">) => {
    const newJoke: Joke = {
      ...jokeData,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storage.saveJoke(newJoke);
    setJokes((prev) => [...prev, newJoke]);

    return newJoke;
  }, []);

  // Update existing joke
  const updateJoke = useCallback((id: string, updates: Partial<Joke>) => {
    const joke = storage.getJoke(id);
    if (!joke) return null;

    const updatedJoke: Joke = {
      ...joke,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: Date.now(),
    };

    storage.saveJoke(updatedJoke);
    setJokes((prev) => prev.map((j) => (j.id === id ? updatedJoke : j)));

    return updatedJoke;
  }, []);

  // Delete joke
  const deleteJoke = useCallback((id: string) => {
    storage.deleteJoke(id);
    setJokes((prev) => prev.filter((j) => j.id !== id));
  }, []);

  // Get single joke
  const getJoke = useCallback(
    (id: string) => {
      return jokes.find((j) => j.id === id) || null;
    },
    [jokes]
  );

  // Add version to joke's history
  const addVersion = useCallback(
    (jokeId: string, setup: string, punchline: string, tags: string[], notes: string = "") => {
      const joke = getJoke(jokeId);
      if (!joke) return null;

      const newVersion: JokeVersion = {
        id: generateId(),
        setup,
        punchline,
        tags,
        createdAt: Date.now(),
        notes,
      };

      const updatedJoke: Joke = {
        ...joke,
        versions: [...joke.versions, newVersion],
        updatedAt: Date.now(),
      };

      storage.saveJoke(updatedJoke);
      setJokes((prev) => prev.map((j) => (j.id === jokeId ? updatedJoke : j)));

      return updatedJoke;
    },
    [getJoke]
  );

  // Restore a previous version
  const restoreVersion = useCallback(
    (jokeId: string, versionId: string) => {
      const joke = getJoke(jokeId);
      if (!joke) return null;

      const version = joke.versions.find((v) => v.id === versionId);
      if (!version) return null;

      return updateJoke(jokeId, {
        setup: version.setup,
        punchline: version.punchline,
        tags: version.tags,
      });
    },
    [getJoke, updateJoke]
  );

  // Filter jokes
  const filterJokes = useCallback(
    (filters: JokeFilters) => {
      let filtered = [...jokes];

      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter((j) => filters.status!.includes(j.status));
      }

      if (filters.energy && filters.energy.length > 0) {
        filtered = filtered.filter((j) => filters.energy!.includes(j.energy));
      }

      if (filters.type && filters.type.length > 0) {
        filtered = filtered.filter((j) => filters.type!.includes(j.type));
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((j) =>
          filters.tags!.some((tag) => j.tags.includes(tag))
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(searchLower) ||
            j.setup.toLowerCase().includes(searchLower) ||
            j.punchline.toLowerCase().includes(searchLower) ||
            j.notes.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    },
    [jokes]
  );

  // Sort jokes
  const sortJokes = useCallback((jokesToSort: Joke[], sortOption: JokeSortOption) => {
    const sorted = [...jokesToSort];

    const getPerformanceRating = (joke: Joke): number => {
      if (joke.performances.length === 0) {
        return 0;
      }

      const scores: Record<Joke["performances"][number]["outcome"], number> = {
        killed: 100,
        worked: 70,
        neutral: 50,
        bombed: 20,
      };

      const totalScore = joke.performances.reduce((sum, performance) => {
        return sum + scores[performance.outcome];
      }, 0);

      return totalScore / joke.performances.length;
    };

    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortOption.field) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "estimatedTime":
          aValue = a.estimatedTime;
          bValue = b.estimatedTime;
          break;
        case "createdAt":
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case "updatedAt":
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case "performanceRating":
          aValue = getPerformanceRating(a);
          bValue = getPerformanceRating(b);
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue === bValue) {
        return 0;
      }

      if (sortOption.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      }

      return aValue < bValue ? 1 : -1;
    });

    return sorted;
  }, []);

  return {
    jokes,
    loading,
    createJoke,
    updateJoke,
    deleteJoke,
    getJoke,
    addVersion,
    restoreVersion,
    filterJokes,
    sortJokes,
  };
}
