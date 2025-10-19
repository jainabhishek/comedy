import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Routine } from "@/lib/types";

// API client functions
async function fetchRoutines(): Promise<Routine[]> {
  const res = await fetch("/api/routines");
  if (!res.ok) throw new Error("Failed to fetch routines");
  const data = await res.json();
  return data.routines;
}

async function createRoutine(
  routine: Omit<Routine, "id" | "createdAt" | "updatedAt" | "currentTime">
): Promise<Routine> {
  const res = await fetch("/api/routines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(routine),
  });
  if (!res.ok) throw new Error("Failed to create routine");
  const data = await res.json();
  return data.routine;
}

async function updateRoutine(id: string, updates: Partial<Routine>): Promise<Routine> {
  const res = await fetch(`/api/routines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update routine");
  const data = await res.json();
  return data.routine;
}

async function deleteRoutine(id: string): Promise<void> {
  const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete routine");
}

// React Query hook
export function useRoutinesQuery() {
  const queryClient = useQueryClient();

  const { data: routines = [], isLoading: loading } = useQuery({
    queryKey: ["routines"],
    queryFn: fetchRoutines,
  });

  const createMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: (newRoutine) => {
      queryClient.setQueryData<Routine[]>(["routines"], (old = []) => [newRoutine, ...old]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Routine> }) =>
      updateRoutine(id, updates),
    onSuccess: (updatedRoutine) => {
      queryClient.setQueryData<Routine[]>(["routines"], (old = []) =>
        old.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Routine[]>(["routines"], (old = []) =>
        old.filter((r) => r.id !== id)
      );
    },
  });

  return {
    routines,
    loading,
    createRoutine: (routine: Omit<Routine, "id" | "createdAt" | "updatedAt" | "currentTime">) => {
      return createMutation.mutateAsync(routine);
    },
    updateRoutine: (id: string, updates: Partial<Routine>) => {
      return updateMutation.mutateAsync({ id, updates });
    },
    deleteRoutine: (id: string) => {
      return deleteMutation.mutateAsync(id);
    },
    getRoutine: (id: string) => routines.find((r) => r.id === id) || null,
    // Helper methods
    addJokeToRoutine: async (routineId: string, jokeId: string, position?: number) => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return null;

      const newJokeIds = [...routine.jokeIds];
      if (position !== undefined) {
        newJokeIds.splice(position, 0, jokeId);
      } else {
        newJokeIds.push(jokeId);
      }

      return updateMutation.mutateAsync({ id: routineId, updates: { jokeIds: newJokeIds } });
    },
    removeJokeFromRoutine: async (routineId: string, jokeId: string) => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return null;

      const newJokeIds = routine.jokeIds.filter((id) => id !== jokeId);
      return updateMutation.mutateAsync({ id: routineId, updates: { jokeIds: newJokeIds } });
    },
    reorderJokes: async (routineId: string, newJokeIds: string[]) => {
      return updateMutation.mutateAsync({ id: routineId, updates: { jokeIds: newJokeIds } });
    },
  };
}
