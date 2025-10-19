import type { Joke, Routine, Premise, Performance, StorageData } from "./types";
import { safeJsonParse, safeJsonStringify } from "./utils";

const STORAGE_KEY = "comedy-app-data";
const STORAGE_VERSION = "1.0.0";

// Storage Service Class
class StorageService {
  private data: StorageData;

  constructor() {
    this.data = this.loadData();
  }

  // Initialize or load data from localStorage
  private loadData(): StorageData {
    if (typeof window === "undefined") {
      return this.getEmptyData();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getEmptyData();
      }

      const parsed = safeJsonParse<StorageData>(stored, this.getEmptyData());

      // Validate and migrate if needed
      if (parsed.version !== STORAGE_VERSION) {
        return this.migrateData(parsed);
      }

      return parsed;
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      return this.getEmptyData();
    }
  }

  // Save data to localStorage
  private saveData(): void {
    if (typeof window === "undefined") return;

    try {
      this.data.lastUpdated = Date.now();
      const serialized = safeJsonStringify(this.data);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error("Error saving data to localStorage:", error);

      // Check if quota exceeded
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.error("LocalStorage quota exceeded. Consider cleaning old data.");
        throw new Error("Storage quota exceeded. Please delete some old data.");
      }
    }
  }

  // Get empty data structure
  private getEmptyData(): StorageData {
    return {
      jokes: [],
      routines: [],
      premises: [],
      performances: [],
      version: STORAGE_VERSION,
      lastUpdated: Date.now(),
    };
  }

  // Migrate data from old version
  private migrateData(oldData: StorageData): StorageData {
    console.log(`Migrating data from version ${oldData.version} to ${STORAGE_VERSION}`);
    // For now, just return the data with updated version
    // In future, add migration logic here
    return {
      ...oldData,
      version: STORAGE_VERSION,
    };
  }

  // ===== JOKE CRUD =====

  saveJoke(joke: Joke): void {
    const index = this.data.jokes.findIndex((j) => j.id === joke.id);

    if (index >= 0) {
      // Update existing
      this.data.jokes[index] = { ...joke, updatedAt: Date.now() };
    } else {
      // Add new
      this.data.jokes.push(joke);
    }

    this.saveData();
  }

  getJoke(id: string): Joke | null {
    return this.data.jokes.find((j) => j.id === id) || null;
  }

  getAllJokes(): Joke[] {
    return [...this.data.jokes];
  }

  deleteJoke(id: string): void {
    this.data.jokes = this.data.jokes.filter((j) => j.id !== id);

    // Also remove from routines
    this.data.routines.forEach((routine) => {
      routine.jokeIds = routine.jokeIds.filter((jid) => jid !== id);
    });

    // Delete associated performances
    this.data.performances = this.data.performances.filter((p) => p.jokeId !== id);

    this.saveData();
  }

  // ===== ROUTINE CRUD =====

  saveRoutine(routine: Routine): void {
    const index = this.data.routines.findIndex((r) => r.id === routine.id);

    if (index >= 0) {
      this.data.routines[index] = { ...routine, updatedAt: Date.now() };
    } else {
      this.data.routines.push(routine);
    }

    this.saveData();
  }

  getRoutine(id: string): Routine | null {
    return this.data.routines.find((r) => r.id === id) || null;
  }

  getAllRoutines(): Routine[] {
    return [...this.data.routines];
  }

  deleteRoutine(id: string): void {
    this.data.routines = this.data.routines.filter((r) => r.id !== id);

    // Delete associated performances
    this.data.performances = this.data.performances.filter((p) => p.routineId !== id);

    this.saveData();
  }

  // ===== PREMISE CRUD =====

  savePremise(premise: Premise): void {
    const index = this.data.premises.findIndex((p) => p.id === premise.id);

    if (index >= 0) {
      this.data.premises[index] = premise;
    } else {
      this.data.premises.push(premise);
    }

    this.saveData();
  }

  getPremise(id: string): Premise | null {
    return this.data.premises.find((p) => p.id === id) || null;
  }

  getAllPremises(): Premise[] {
    return [...this.data.premises];
  }

  deletePremise(id: string): void {
    this.data.premises = this.data.premises.filter((p) => p.id !== id);
    this.saveData();
  }

  // ===== PERFORMANCE CRUD =====

  savePerformance(performance: Performance): void {
    const index = this.data.performances.findIndex((p) => p.id === performance.id);

    if (index >= 0) {
      this.data.performances[index] = performance;
    } else {
      this.data.performances.push(performance);
    }

    // Also add to joke's performance array
    const joke = this.getJoke(performance.jokeId);
    if (joke) {
      const perfIndex = joke.performances.findIndex((p) => p.id === performance.id);
      if (perfIndex >= 0) {
        joke.performances[perfIndex] = performance;
      } else {
        joke.performances.push(performance);
      }
      this.saveJoke(joke);
    }

    this.saveData();
  }

  getPerformance(id: string): Performance | null {
    return this.data.performances.find((p) => p.id === id) || null;
  }

  getAllPerformances(): Performance[] {
    return [...this.data.performances];
  }

  getPerformancesByJoke(jokeId: string): Performance[] {
    return this.data.performances.filter((p) => p.jokeId === jokeId);
  }

  getPerformancesByRoutine(routineId: string): Performance[] {
    return this.data.performances.filter((p) => p.routineId === routineId);
  }

  deletePerformance(id: string): void {
    const performance = this.getPerformance(id);

    if (performance) {
      // Remove from joke's performances
      const joke = this.getJoke(performance.jokeId);
      if (joke) {
        joke.performances = joke.performances.filter((p) => p.id !== id);
        this.saveJoke(joke);
      }
    }

    this.data.performances = this.data.performances.filter((p) => p.id !== id);
    this.saveData();
  }

  // ===== EXPORT / IMPORT =====

  exportData(): string {
    return safeJsonStringify(this.data, "{}");
  }

  importData(jsonString: string): void {
    try {
      const imported = safeJsonParse<StorageData>(jsonString, this.getEmptyData());

      // Validate imported data
      if (!imported.jokes || !imported.routines || !imported.performances) {
        throw new Error("Invalid data format");
      }

      // Merge with existing data (avoid duplicates)
      const existingJokeIds = new Set(this.data.jokes.map((j) => j.id));
      const existingRoutineIds = new Set(this.data.routines.map((r) => r.id));
      const existingPerformanceIds = new Set(this.data.performances.map((p) => p.id));

      imported.jokes.forEach((joke) => {
        if (!existingJokeIds.has(joke.id)) {
          this.data.jokes.push(joke);
        }
      });

      imported.routines.forEach((routine) => {
        if (!existingRoutineIds.has(routine.id)) {
          this.data.routines.push(routine);
        }
      });

      imported.performances.forEach((perf) => {
        if (!existingPerformanceIds.has(perf.id)) {
          this.data.performances.push(perf);
        }
      });

      this.saveData();
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error("Failed to import data. Invalid format.");
    }
  }

  // ===== BACKUP / RESTORE =====

  createBackup(): string {
    const backup = {
      ...this.data,
      backupDate: Date.now(),
    };
    return safeJsonStringify(backup);
  }

  restoreBackup(backupString: string): void {
    try {
      const backup = safeJsonParse<StorageData>(backupString, this.getEmptyData());
      this.data = backup;
      this.saveData();
    } catch (error) {
      console.error("Error restoring backup:", error);
      throw new Error("Failed to restore backup. Invalid format.");
    }
  }

  // ===== UTILITY =====

  clearAllData(): void {
    this.data = this.getEmptyData();
    this.saveData();
  }

  getDataStats() {
    return {
      totalJokes: this.data.jokes.length,
      totalRoutines: this.data.routines.length,
      totalPremises: this.data.premises.length,
      totalPerformances: this.data.performances.length,
      lastUpdated: this.data.lastUpdated,
    };
  }
}

// Export singleton instance
export const storage = new StorageService();
