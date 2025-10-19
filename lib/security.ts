import { auth } from "@/auth";
import { NextResponse } from "next/server";

type JokeValidationPayload = {
  title?: unknown;
  setup?: unknown;
  punchline?: unknown;
  energy?: unknown;
  type?: unknown;
  status?: unknown;
  estimatedTime?: unknown;
  tags?: unknown;
};

type RoutineValidationPayload = {
  name?: unknown;
  targetTime?: unknown;
  jokeIds?: unknown;
};

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
    throw new Error("Forbidden: You do not own this resource");
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
export function validateJokeData(data: JokeValidationPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const title = data.title;
  if (typeof title !== "string" || title.length === 0) {
    errors.push("Title is required and must be a string");
  } else if (title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  const setup = data.setup;
  if (typeof setup !== "string" || setup.length === 0) {
    errors.push("Setup is required and must be a string");
  } else if (setup.length > 5000) {
    errors.push("Setup must be less than 5000 characters");
  }

  const punchline = data.punchline;
  if (typeof punchline !== "string" || punchline.length === 0) {
    errors.push("Punchline is required and must be a string");
  } else if (punchline.length > 5000) {
    errors.push("Punchline must be less than 5000 characters");
  }

  const energy = data.energy;
  const validEnergies = ["low", "medium", "high"];
  if (energy !== undefined) {
    if (typeof energy !== "string" || !validEnergies.includes(energy)) {
      errors.push("Energy must be one of: low, medium, high");
    }
  }

  const type = data.type;
  const validTypes = ["observational", "one-liner", "story", "callback", "crowd-work"];
  if (type !== undefined) {
    if (typeof type !== "string" || !validTypes.includes(type)) {
      errors.push("Type must be one of: observational, one-liner, story, callback, crowd-work");
    }
  }

  const status = data.status;
  const validStatuses = ["draft", "working", "polished", "retired"];
  if (status !== undefined) {
    if (typeof status !== "string" || !validStatuses.includes(status)) {
      errors.push("Status must be one of: draft, working, polished, retired");
    }
  }

  const estimatedTime = data.estimatedTime;
  if (
    estimatedTime !== undefined &&
    (typeof estimatedTime !== "number" || estimatedTime < 0 || estimatedTime > 600)
  ) {
    errors.push("Estimated time must be a number between 0 and 600 seconds");
  }

  const tags = data.tags;
  if (tags !== undefined && !Array.isArray(tags)) {
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
export function validateRoutineData(data: RoutineValidationPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const name = data.name;
  if (typeof name !== "string" || name.length === 0) {
    errors.push("Name is required and must be a string");
  } else if (name.length > 200) {
    errors.push("Name must be less than 200 characters");
  }

  const targetTime = data.targetTime;
  if (
    targetTime !== undefined &&
    (typeof targetTime !== "number" || targetTime < 0 || targetTime > 3600)
  ) {
    errors.push("Target time must be a number between 0 and 3600 seconds");
  }

  const jokeIds = data.jokeIds;
  if (jokeIds !== undefined && !Array.isArray(jokeIds)) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
