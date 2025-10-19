import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/migrate - Migrate LocalStorage data to database
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jokes = [], routines = [] } = body;

    let jokesCreated = 0;
    let routinesCreated = 0;
    const jokeIdMap = new Map<string, string>(); // old ID -> new ID

    // Migrate jokes
    for (const localJoke of jokes) {
      try {
        const newJoke = await prisma.joke.create({
          data: {
            userId: session.user.id,
            premiseId: localJoke.premiseId,
            title: localJoke.title,
            setup: localJoke.setup,
            punchline: localJoke.punchline,
            tags: localJoke.tags || [],
            estimatedTime: localJoke.estimatedTime || 30,
            energy: localJoke.energy || "medium",
            type: localJoke.type || "observational",
            status: localJoke.status || "draft",
            notes: localJoke.notes || "",
            createdAt: localJoke.createdAt
              ? new Date(localJoke.createdAt)
              : new Date(),
            updatedAt: localJoke.updatedAt
              ? new Date(localJoke.updatedAt)
              : new Date(),
          },
        });

        // Map old ID to new ID
        jokeIdMap.set(localJoke.id, newJoke.id);

        // Migrate versions
        if (localJoke.versions && Array.isArray(localJoke.versions)) {
          for (const version of localJoke.versions) {
            await prisma.jokeVersion.create({
              data: {
                jokeId: newJoke.id,
                setup: version.setup,
                punchline: version.punchline,
                tags: version.tags || [],
                notes: version.notes || "",
                createdAt: version.createdAt
                  ? new Date(version.createdAt)
                  : new Date(),
              },
            });
          }
        }

        // Migrate performances
        if (
          localJoke.performances &&
          Array.isArray(localJoke.performances)
        ) {
          for (const performance of localJoke.performances) {
            await prisma.performance.create({
              data: {
                userId: session.user.id,
                jokeId: newJoke.id,
                routineId: performance.routineId,
                date: performance.date ? new Date(performance.date) : new Date(),
                actualTime: performance.actualTime || 0,
                outcome: performance.outcome || "neutral",
                notes: performance.notes || "",
                venue: performance.venue,
              },
            });
          }
        }

        jokesCreated++;
      } catch (error) {
        console.error("Error migrating joke:", error);
        // Continue with next joke
      }
    }

    // Migrate routines
    for (const localRoutine of routines) {
      try {
        // Map old joke IDs to new joke IDs
        const mappedJokeIds = localRoutine.jokeIds
          .map((oldId: string) => jokeIdMap.get(oldId))
          .filter((id: string | undefined): id is string => id !== undefined);

        const newRoutine = await prisma.routine.create({
          data: {
            userId: session.user.id,
            name: localRoutine.name,
            targetTime: localRoutine.targetTime || 300,
            flowScore: localRoutine.flowScore,
            createdAt: localRoutine.createdAt
              ? new Date(localRoutine.createdAt)
              : new Date(),
            updatedAt: localRoutine.updatedAt
              ? new Date(localRoutine.updatedAt)
              : new Date(),
          },
        });

        // Add jokes to routine
        for (let i = 0; i < mappedJokeIds.length; i++) {
          await prisma.routineJoke.create({
            data: {
              routineId: newRoutine.id,
              jokeId: mappedJokeIds[i],
              order: i,
            },
          });
        }

        routinesCreated++;
      } catch (error) {
        console.error("Error migrating routine:", error);
        // Continue with next routine
      }
    }

    return NextResponse.json({
      success: true,
      jokesCreated,
      routinesCreated,
      message: `Successfully migrated ${jokesCreated} jokes and ${routinesCreated} routines`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Failed to migrate data" },
      { status: 500 }
    );
  }
}

