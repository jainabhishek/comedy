import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/jokes/[id] - Get a single joke
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const joke = await prisma.joke.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { createdAt: "desc" } },
        performances: { orderBy: { date: "desc" } },
      },
    });

    if (!joke) {
      return NextResponse.json({ error: "Joke not found" }, { status: 404 });
    }

    // Verify ownership
    if (joke.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    };

    return NextResponse.json({ joke: transformedJoke });
  } catch (error) {
    console.error("Error fetching joke:", error);
    return NextResponse.json({ error: "Failed to fetch joke" }, { status: 500 });
  }
}

// PATCH /api/jokes/[id] - Update a joke
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existingJoke = await prisma.joke.findUnique({ where: { id } });
    if (!existingJoke) {
      return NextResponse.json({ error: "Joke not found" }, { status: 404 });
    }
    if (existingJoke.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If setup or punchline changed, create a version
    const needsVersion =
      (body.setup && body.setup !== existingJoke.setup) ||
      (body.punchline && body.punchline !== existingJoke.punchline);

    if (needsVersion) {
      await prisma.jokeVersion.create({
        data: {
          jokeId: id,
          setup: existingJoke.setup,
          punchline: existingJoke.punchline,
          tags: existingJoke.tags,
          notes: existingJoke.notes,
        },
      });
    }

    // Update the joke
    const joke = await prisma.joke.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.setup !== undefined && { setup: body.setup }),
        ...(body.punchline !== undefined && { punchline: body.punchline }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.estimatedTime !== undefined && {
          estimatedTime: body.estimatedTime,
        }),
        ...(body.energy !== undefined && { energy: body.energy }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        versions: { orderBy: { createdAt: "desc" } },
        performances: { orderBy: { date: "desc" } },
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
    };

    return NextResponse.json({ joke: transformedJoke });
  } catch (error) {
    console.error("Error updating joke:", error);
    return NextResponse.json({ error: "Failed to update joke" }, { status: 500 });
  }
}

// DELETE /api/jokes/[id] - Delete a joke
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const joke = await prisma.joke.findUnique({ where: { id } });
    if (!joke) {
      return NextResponse.json({ error: "Joke not found" }, { status: 404 });
    }
    if (joke.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete joke (cascade will handle versions and performances)
    await prisma.joke.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting joke:", error);
    return NextResponse.json({ error: "Failed to delete joke" }, { status: 500 });
  }
}
