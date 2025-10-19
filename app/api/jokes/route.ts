import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/jokes - Get all jokes for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jokes = await prisma.joke.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
        },
        performances: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform database format to app format
    const transformedJokes = jokes.map((joke) => ({
      id: joke.id,
      premiseId: joke.premiseId,
      title: joke.title,
      setup: joke.setup,
      punchline: joke.punchline,
      tags: joke.tags,
      estimatedTime: joke.estimatedTime,
      energy: joke.energy as "low" | "medium" | "high",
      type: joke.type as "observational" | "one-liner" | "story" | "callback" | "crowd-work",
      status: joke.status as "draft" | "working" | "polished" | "retired",
      notes: joke.notes || "",
      createdAt: joke.createdAt.getTime(),
      updatedAt: joke.updatedAt.getTime(),
      versions: joke.versions.map((v) => ({
        id: v.id,
        setup: v.setup,
        punchline: v.punchline,
        tags: v.tags,
        notes: v.notes || "",
        createdAt: v.createdAt.getTime(),
      })),
      performances: joke.performances.map((p) => ({
        id: p.id,
        jokeId: p.jokeId,
        routineId: p.routineId,
        date: p.date.getTime(),
        actualTime: p.actualTime,
        outcome: p.outcome as "killed" | "worked" | "bombed" | "neutral",
        notes: p.notes || "",
        venue: p.venue,
      })),
    }));

    return NextResponse.json({ jokes: transformedJokes });
  } catch (error) {
    console.error("Error fetching jokes:", error);
    return NextResponse.json(
      { error: "Failed to fetch jokes" },
      { status: 500 }
    );
  }
}

// POST /api/jokes - Create a new joke
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const joke = await prisma.joke.create({
      data: {
        userId: session.user.id,
        premiseId: body.premiseId,
        title: body.title,
        setup: body.setup,
        punchline: body.punchline,
        tags: body.tags || [],
        estimatedTime: body.estimatedTime || 30,
        energy: body.energy || "medium",
        type: body.type || "observational",
        status: body.status || "draft",
        notes: body.notes || "",
      },
      include: {
        versions: true,
        performances: true,
      },
    });

    // Transform to app format
    const transformedJoke = {
      id: joke.id,
      premiseId: joke.premiseId,
      title: joke.title,
      setup: joke.setup,
      punchline: joke.punchline,
      tags: joke.tags,
      estimatedTime: joke.estimatedTime,
      energy: joke.energy as "low" | "medium" | "high",
      type: joke.type as "observational" | "one-liner" | "story" | "callback" | "crowd-work",
      status: joke.status as "draft" | "working" | "polished" | "retired",
      notes: joke.notes || "",
      createdAt: joke.createdAt.getTime(),
      updatedAt: joke.updatedAt.getTime(),
      versions: [],
      performances: [],
    };

    return NextResponse.json({ joke: transformedJoke }, { status: 201 });
  } catch (error) {
    console.error("Error creating joke:", error);
    return NextResponse.json(
      { error: "Failed to create joke" },
      { status: 500 }
    );
  }
}

