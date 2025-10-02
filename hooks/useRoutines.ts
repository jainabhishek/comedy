import { useState, useEffect, useCallback } from "react";
import type { Routine, Joke } from "@/lib/types";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/utils";

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  // Load routines from storage on mount
  useEffect(() => {
    const loadRoutines = () => {
      const allRoutines = storage.getAllRoutines();
      setRoutines(allRoutines);
      setLoading(false);
    };

    loadRoutines();
  }, []);

  // Create new routine
  const createRoutine = useCallback(
    (routineData: Omit<Routine, "id" | "createdAt" | "updatedAt">) => {
      const newRoutine: Routine = {
        ...routineData,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveRoutine(newRoutine);
      setRoutines((prev) => [...prev, newRoutine]);

      return newRoutine;
    },
    []
  );

  // Update existing routine
  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    const routine = storage.getRoutine(id);
    if (!routine) return null;

    const updatedRoutine: Routine = {
      ...routine,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: Date.now(),
    };

    storage.saveRoutine(updatedRoutine);
    setRoutines((prev) => prev.map((r) => (r.id === id ? updatedRoutine : r)));

    return updatedRoutine;
  }, []);

  // Delete routine
  const deleteRoutine = useCallback((id: string) => {
    storage.deleteRoutine(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Get single routine
  const getRoutine = useCallback(
    (id: string) => {
      return routines.find((r) => r.id === id) || null;
    },
    [routines]
  );

  // Add joke to routine
  const addJokeToRoutine = useCallback(
    (routineId: string, jokeId: string, position?: number) => {
      const routine = getRoutine(routineId);
      if (!routine) return null;

      const newJokeIds = [...routine.jokeIds];

      // If position specified, insert at that position
      if (position !== undefined) {
        newJokeIds.splice(position, 0, jokeId);
      } else {
        // Otherwise, add to end
        newJokeIds.push(jokeId);
      }

      return updateRoutine(routineId, { jokeIds: newJokeIds });
    },
    [getRoutine, updateRoutine]
  );

  // Remove joke from routine
  const removeJokeFromRoutine = useCallback(
    (routineId: string, jokeId: string) => {
      const routine = getRoutine(routineId);
      if (!routine) return null;

      const newJokeIds = routine.jokeIds.filter((id) => id !== jokeId);

      return updateRoutine(routineId, { jokeIds: newJokeIds });
    },
    [getRoutine, updateRoutine]
  );

  // Reorder jokes in routine
  const reorderJokes = useCallback(
    (routineId: string, newJokeIds: string[]) => {
      return updateRoutine(routineId, { jokeIds: newJokeIds });
    },
    [updateRoutine]
  );

  // Calculate total time for routine
  const calculateRoutineTime = useCallback((routine: Routine, jokes: Joke[]) => {
    const totalTime = routine.jokeIds.reduce((sum, jokeId) => {
      const joke = jokes.find((j) => j.id === jokeId);
      return sum + (joke?.estimatedTime || 0);
    }, 0);

    return totalTime;
  }, []);

  // Get jokes for a routine in order
  const getRoutineJokes = useCallback((routine: Routine, allJokes: Joke[]) => {
    return routine.jokeIds
      .map((jokeId) => allJokes.find((j) => j.id === jokeId))
      .filter((j): j is Joke => j !== undefined);
  }, []);

  return {
    routines,
    loading,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    getRoutine,
    addJokeToRoutine,
    removeJokeFromRoutine,
    reorderJokes,
    calculateRoutineTime,
    getRoutineJokes,
  };
}
