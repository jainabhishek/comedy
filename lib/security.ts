import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Require authentication for API routes
 * Returns the authenticated user or throws an error
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  return session.user;
}

/**
 * Check if the authenticated user owns the resource
 */
export function requireOwnership(userId: string, resourceUserId: string) {
  if (userId !== resourceUserId) {
    throw new Error("Forbidden: You don't own this resource");
  }
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

/**
 * Validate joke data
 */
export function validateJokeData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push("Title is required and must be a string");
  } else if (data.title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  if (!data.setup || typeof data.setup !== "string") {
    errors.push("Setup is required and must be a string");
  } else if (data.setup.length > 5000) {
    errors.push("Setup must be less than 5000 characters");
  }

  if (!data.punchline || typeof data.punchline !== "string") {
    errors.push("Punchline is required and must be a string");
  } else if (data.punchline.length > 5000) {
    errors.push("Punchline must be less than 5000 characters");
  }

  const validEnergies = ["low", "medium", "high"];
  if (data.energy && !validEnergies.includes(data.energy)) {
    errors.push("Energy must be one of: low, medium, high");
  }

  const validTypes = ["observational", "one-liner", "story", "callback", "crowd-work"];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push("Type must be one of: observational, one-liner, story, callback, crowd-work");
  }

  const validStatuses = ["draft", "working", "polished", "retired"];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push("Status must be one of: draft, working, polished, retired");
  }

  if (data.estimatedTime && (typeof data.estimatedTime !== "number" || data.estimatedTime < 0 || data.estimatedTime > 600)) {
    errors.push("Estimated time must be a number between 0 and 600 seconds");
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate routine data
 */
export function validateRoutineData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string") {
    errors.push("Name is required and must be a string");
  } else if (data.name.length > 200) {
    errors.push("Name must be less than 200 characters");
  }

  if (data.targetTime && (typeof data.targetTime !== "number" || data.targetTime < 0 || data.targetTime > 3600)) {
    errors.push("Target time must be a number between 0 and 3600 seconds");
  }

  if (data.jokeIds && !Array.isArray(data.jokeIds)) {
    errors.push("Joke IDs must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Rate limiting helper (in-memory, simple version)
 * For production, use a Redis-based solution
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

