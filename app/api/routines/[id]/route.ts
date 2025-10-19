import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/routines/[id] - Get a single routine
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const routine = await prisma.routine.findUnique({
      where: { id },
      include: {
        jokes: {
          include: { joke: true },
          orderBy: { order: "asc" },
        },
        performances: { orderBy: { date: "desc" } },
      },
    });

    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    // Verify ownership
    if (routine.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const jokeIds = routine.jokes.map((rj) => rj.jokeId);
    const currentTime = routine.jokes.reduce((sum, rj) => sum + rj.joke.estimatedTime, 0);

    const transformedRoutine = {
      id: routine.id,
      name: routine.name,
      jokeIds,
      targetTime: routine.targetTime,
      currentTime,
      flowScore: routine.flowScore,
      createdAt: routine.createdAt.getTime(),
      updatedAt: routine.updatedAt.getTime(),
    };

    return NextResponse.json({ routine: transformedRoutine });
  } catch (error) {
    console.error("Error fetching routine:", error);
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 });
  }
}

// PATCH /api/routines/[id] - Update a routine
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existingRoutine = await prisma.routine.findUnique({ where: { id } });
    if (!existingRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    if (existingRoutine.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update routine
    await prisma.routine.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.targetTime !== undefined && { targetTime: body.targetTime }),
        ...(body.flowScore !== undefined && { flowScore: body.flowScore }),
      },
    });

    // Update joke order if provided
    if (body.jokeIds && Array.isArray(body.jokeIds)) {
      // Delete existing routine jokes
      await prisma.routineJoke.deleteMany({
        where: { routineId: id },
      });

      // Create new routine jokes with updated order
      await Promise.all(
        body.jokeIds.map((jokeId: string, index: number) =>
          prisma.routineJoke.create({
            data: {
              routineId: id,
              jokeId,
              order: index,
            },
          })
        )
      );
    }

    // Fetch updated routine with jokes
    const updatedRoutine = await prisma.routine.findUnique({
      where: { id },
      include: {
        jokes: {
          include: { joke: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!updatedRoutine) {
      throw new Error("Failed to fetch updated routine");
    }

    const jokeIds = updatedRoutine.jokes.map((rj) => rj.jokeId);
    const currentTime = updatedRoutine.jokes.reduce((sum, rj) => sum + rj.joke.estimatedTime, 0);

    const transformedRoutine = {
      id: updatedRoutine.id,
      name: updatedRoutine.name,
      jokeIds,
      targetTime: updatedRoutine.targetTime,
      currentTime,
      flowScore: updatedRoutine.flowScore,
      createdAt: updatedRoutine.createdAt.getTime(),
      updatedAt: updatedRoutine.updatedAt.getTime(),
    };

    return NextResponse.json({ routine: transformedRoutine });
  } catch (error) {
    console.error("Error updating routine:", error);
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
  }
}

// DELETE /api/routines/[id] - Delete a routine
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const routine = await prisma.routine.findUnique({ where: { id } });
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    if (routine.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete routine (cascade will handle routine jokes)
    await prisma.routine.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting routine:", error);
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}
