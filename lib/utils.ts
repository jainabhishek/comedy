import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import { format, formatDistance, formatDuration, intervalToDuration } from "date-fns";

// Tailwind className merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ID Generation
export function generateId(): string {
  return nanoid();
}

// Date Formatting
export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), "MMM d, yyyy");
}

export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
}

// Time Formatting (for joke durations and performance times)
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatDurationHuman(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return formatDuration(duration, { format: ["minutes", "seconds"] });
}

// Parse time string (mm:ss) to seconds
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  return 0;
}

// Data Validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}

// Number Utilities
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundToDecimal(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// Array Utilities
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

// String Utilities
export function truncate(str: string, maxLength: number, suffix: string = "..."): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalizeFirst(word))
    .join(" ");
}

// Performance Rating Calculation
export function calculatePerformanceRating(
  performances: Array<{ outcome: string }>
): number {
  if (performances.length === 0) return 0;

  const outcomeScores = {
    killed: 100,
    worked: 70,
    neutral: 50,
    bombed: 20,
  };

  const totalScore = performances.reduce((sum, perf) => {
    return sum + (outcomeScores[perf.outcome as keyof typeof outcomeScores] || 0);
  }, 0);

  return Math.round(totalScore / performances.length);
}

// Debounce Function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle Function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Local Storage Utilities
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(obj: unknown, fallback: string = "{}"): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return fallback;
  }
}

// Color Utilities for Energy Levels
export function getEnergyColor(energy: "low" | "medium" | "high"): string {
  const colors = {
    low: "text-blue-600",
    medium: "text-amber-600",
    high: "text-red-600",
  };
  return colors[energy];
}

export function getStatusColor(
  status: "draft" | "working" | "polished" | "retired"
): string {
  const colors = {
    draft: "text-gray-600",
    working: "text-amber-600",
    polished: "text-green-600",
    retired: "text-gray-400",
  };
  return colors[status];
}

export function getOutcomeColor(
  outcome: "killed" | "worked" | "bombed" | "neutral"
): string {
  const colors = {
    killed: "text-green-600",
    worked: "text-blue-600",
    neutral: "text-gray-600",
    bombed: "text-red-600",
  };
  return colors[outcome];
}

// Search/Filter Utilities
export function searchInText(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
