import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Joke } from "@/lib/types";

// API client functions
async function fetchJokes(): Promise<Joke[]> {
  const res = await fetch("/api/jokes");
  if (!res.ok) throw new Error("Failed to fetch jokes");
  const data = await res.json();
  return data.jokes;
}

async function createJoke(joke: Omit<Joke, "id" | "createdAt" | "updatedAt" | "versions" | "performances">): Promise<Joke> {
  const res = await fetch("/api/jokes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(joke),
  });
  if (!res.ok) throw new Error("Failed to create joke");
  const data = await res.json();
  return data.joke;
}

async function updateJoke(id: string, updates: Partial<Joke>): Promise<Joke> {
  const res = await fetch(`/api/jokes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update joke");
  const data = await res.json();
  return data.joke;
}

async function deleteJoke(id: string): Promise<void> {
  const res = await fetch(`/api/jokes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete joke");
}

// React Query hook
export function useJokesQuery() {
  const queryClient = useQueryClient();

  const { data: jokes = [], isLoading: loading } = useQuery({
    queryKey: ["jokes"],
    queryFn: fetchJokes,
  });

  const createMutation = useMutation({
    mutationFn: createJoke,
    onSuccess: (newJoke) => {
      queryClient.setQueryData<Joke[]>(["jokes"], (old = []) => [newJoke, ...old]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Joke> }) =>
      updateJoke(id, updates),
    onSuccess: (updatedJoke) => {
      queryClient.setQueryData<Joke[]>(["jokes"], (old = []) =>
        old.map((j) => (j.id === updatedJoke.id ? updatedJoke : j))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJoke,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Joke[]>(["jokes"], (old = []) =>
        old.filter((j) => j.id !== id)
      );
    },
  });

  return {
    jokes,
    loading,
    createJoke: (joke: Omit<Joke, "id" | "createdAt" | "updatedAt" | "versions" | "performances">) => {
      return createMutation.mutateAsync(joke);
    },
    updateJoke: (id: string, updates: Partial<Joke>) => {
      return updateMutation.mutateAsync({ id, updates });
    },
    deleteJoke: (id: string) => {
      return deleteMutation.mutateAsync(id);
    },
    getJoke: (id: string) => jokes.find((j) => j.id === id) || null,
  };
}

