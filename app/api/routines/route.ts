import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/routines - Get all routines for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routines = await prisma.routine.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        jokes: {
          include: {
            joke: true,
          },
          orderBy: {
            order: "asc",
          },
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
    const transformedRoutines = routines.map((routine) => {
      const jokeIds = routine.jokes.map((rj) => rj.jokeId);
      const currentTime = routine.jokes.reduce(
        (sum, rj) => sum + rj.joke.estimatedTime,
        0
      );

      return {
        id: routine.id,
        name: routine.name,
        jokeIds,
        targetTime: routine.targetTime,
        currentTime,
        flowScore: routine.flowScore,
        createdAt: routine.createdAt.getTime(),
        updatedAt: routine.updatedAt.getTime(),
      };
    });

    return NextResponse.json({ routines: transformedRoutines });
  } catch (error) {
    console.error("Error fetching routines:", error);
    return NextResponse.json(
      { error: "Failed to fetch routines" },
      { status: 500 }
    );
  }
}

// POST /api/routines - Create a new routine
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const routine = await prisma.routine.create({
      data: {
        userId: session.user.id,
        name: body.name,
        targetTime: body.targetTime || 300,
        flowScore: body.flowScore,
      },
    });

    // Add jokes if provided
    if (body.jokeIds && Array.isArray(body.jokeIds)) {
      await Promise.all(
        body.jokeIds.map((jokeId: string, index: number) =>
          prisma.routineJoke.create({
            data: {
              routineId: routine.id,
              jokeId,
              order: index,
            },
          })
        )
      );
    }

    const transformedRoutine = {
      id: routine.id,
      name: routine.name,
      jokeIds: body.jokeIds || [],
      targetTime: routine.targetTime,
      currentTime: 0,
      flowScore: routine.flowScore,
      createdAt: routine.createdAt.getTime(),
      updatedAt: routine.updatedAt.getTime(),
    };

    return NextResponse.json({ routine: transformedRoutine }, { status: 201 });
  } catch (error) {
    console.error("Error creating routine:", error);
    return NextResponse.json(
      { error: "Failed to create routine" },
      { status: 500 }
    );
  }
}

