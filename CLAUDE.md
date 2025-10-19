# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tight 5** is a production-ready AI-powered comedy writing platform that helps standup comedians develop jokes systematically, build 5-minute routines, track performances, and optimize material using OpenAI GPT-5. The platform features Google OAuth authentication, PostgreSQL database via Supabase, and React Query for server state management.

## Development Commands

### Essential Commands

**Development:**
```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build with Turbopack
npm run start        # Start production server
```

**Code Quality:**
```bash
npm run lint         # Run ESLint
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without modifying
```

**Database:**
```bash
npx prisma generate  # Generate Prisma client after schema changes
npx prisma db push   # Push schema changes to database (development)
npx prisma migrate dev --name <name>  # Create migration (production workflow)
npx prisma studio    # Open Prisma Studio GUI for database inspection
```

### Before Starting Work

1. **Check if dev server is running** - Run `lsof -i :3000` to check port 3000
2. **Never start duplicate servers** - If port 3000 is occupied, use existing server
3. **Pull latest** - Always sync with remote before starting features

## Architecture Overview

### Tech Stack

- **Framework:** Next.js 15.5.4 (App Router) with Turbopack
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL via Supabase + Prisma 6.16.3 ORM
- **Authentication:** NextAuth.js v5 (Google OAuth)
- **State Management:** React Query (@tanstack/react-query) for server state
- **AI:** OpenAI GPT-5 API
- **Drag & Drop:** @hello-pangea/dnd

### Authentication Flow

The app uses NextAuth.js v5 with database sessions (not JWT). Key files:

- `auth.ts` - NextAuth configuration with Google provider and Prisma adapter
- `middleware.ts` - Route protection logic (redirects unauthenticated users)
- `app/api/auth/[...nextauth]/route.ts` - Auth API handlers
- `lib/security.ts` - Helper functions: `requireAuth()`, `requireOwnership()`, validation

**Authentication patterns:**
```typescript
// In API routes
import { requireAuth } from "@/lib/security";

const user = await requireAuth(); // Throws if not authenticated
// user.id is now available for database queries

// For resource ownership validation
import { requireOwnership } from "@/lib/security";
requireOwnership(user.id, resource.userId); // Throws if user doesn't own resource
```

### Database Architecture

**Schema Location:** `prisma/schema.prisma`

**Key Models:**
- `User` - OAuth users (id, email, name, image)
- `Joke` - Complete jokes with setup/punchline (user-scoped)
- `JokeVersion` - Version history for jokes
- `Routine` - 5-minute sets (user-scoped)
- `RoutineJoke` - Join table for jokes in routines with ordering
- `Performance` - Show tracking data
- `UserSettings` - User preferences

**Critical Database Patterns:**
1. **User scoping** - All queries MUST filter by userId from session
2. **Cascade deletes** - Relations use `onDelete: Cascade` for data integrity
3. **Indexes** - Frequently queried fields have indexes (userId, status, createdAt)

**Example query pattern:**
```typescript
// ALWAYS scope by userId from session
const jokes = await prisma.joke.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
  include: { versions: true, performances: true }
});
```

### React Query Integration

The app uses React Query for server state. Custom hooks in `hooks/`:

- `useJokesQuery()` - Jokes CRUD with optimistic updates
- `useRoutinesQuery()` - Routines CRUD with optimistic updates

**Pattern:**
```typescript
const { jokes, loading, createJoke, updateJoke, deleteJoke } = useJokesQuery();

// Mutations automatically invalidate queries and update cache
await createJoke({ title, setup, punchline, ... });
```

### AI Integration Architecture

**AI Service:** All AI operations go through API routes in `app/api/` (server-side only for security)

**Key AI Routes:**
- `POST /api/joke/generate` - Generate joke parts from premise
- `POST /api/joke/improve` - Punch up existing jokes
- `POST /api/joke/analyze` - Analyze weaknesses
- `POST /api/routine/analyze` - Analyze routine flow
- `POST /api/routine/optimize` - Suggest optimal joke ordering
- `POST /api/performance/analyze` - Performance insights

**AI Prompts & Guardrails:** `lib/ai-prompts.ts`
- Task-scoped system prompts for each AI operation
- Input validation to keep AI focused on comedy writing
- Response parsing and cleanup helpers

**Critical AI patterns:**
1. **Never expose API key client-side** - All OpenAI calls happen in API routes
2. **Use guardrails** - Validate inputs with `validateComedyInput()` before sending to AI
3. **Parse responses** - AI returns JSON, strip markdown code blocks if present

### 21 Comedy Structures System

The workshop uses a structure-based approach (`lib/structures.ts`):

**Categories:**
- Core (6): Setup-punchline, rule of three, misdirection, PAAT, plant & payoff, callback
- Wordplay (4): Pun, ambiguity, malapropism, spoonerism
- Comparison (3): Analogy, hyperbole, juxtaposition
- Narrative (5): Story, list escalation, shaggy dog, anti-joke, one-liner
- Interactive (2): Q&A, knock-knock
- Topper (1): Tag stacking

Each structure has:
- `id`, `name`, `category`, `description`, `example`
- `parts[]` - Multi-step parts with labels/descriptions
- AI generates content for each part based on previous selections

## Code Patterns & Best Practices

### API Route Pattern

All API routes follow this structure:

```typescript
import { requireAuth, handleApiError, checkRateLimit } from "@/lib/security";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const data = await prisma.model.findMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Security Validation

Use validation helpers from `lib/security.ts`:

```typescript
import { validateJokeData, sanitizeInput } from "@/lib/security";

const validation = validateJokeData(body);
if (!validation.valid) {
  return NextResponse.json({ errors: validation.errors }, { status: 400 });
}

// Sanitize user inputs
const cleanTitle = sanitizeInput(body.title);
```

### Component Patterns

**Page Structure:**
- Most pages integrate components directly (no separate component files)
- Use `"use client"` directive for client components with hooks
- Async Server Components for initial data fetching

**Conditional Layouts:**
- `components/layout/ConditionalHeader` - Hides header on homepage
- `components/layout/ConditionalMain` - Different container for homepage vs. app pages

### Drag & Drop Pattern

Routine builder uses `@hello-pangea/dnd`:

```typescript
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="available">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {items.map((item, index) => (
          <Draggable key={item.id} draggableId={item.id} index={index}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                {item.content}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

## Working with Plans

The project uses an ExecPlan methodology documented in `plans.md`. Key practices:

1. **Always update plan docs** - When implementing features, update the progress in `docs/IMPLEMENTATION.md` or relevant plan files
2. **Document decisions** - Record architectural decisions in plan files
3. **Track progress** - Mark completed items in checklists

When asked to work on plans or create features, reference `plans.md` for the ExecPlan format.

## Environment Variables

Required in `.env.local`:

```env
# OpenAI API
OPENAI_API_KEY=sk-...

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=... # Generate with: openssl rand -base64 32

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://... # For migrations
```

## Common Tasks

### Adding a New API Route

1. Create route handler in `app/api/[feature]/route.ts`
2. Import `requireAuth` and `handleApiError` from `lib/security.ts`
3. Always scope queries by `user.id` from session
4. Add rate limiting with `checkRateLimit(user.id)`
5. Use `handleApiError(error)` for consistent error responses

### Adding a New Database Model

1. Update `prisma/schema.prisma`
2. Add userId foreign key and relation to User model
3. Add indexes on frequently queried fields
4. Run `npx prisma generate` to update Prisma client
5. Run `npx prisma db push` (dev) or create migration (prod)
6. Update TypeScript types in `lib/types.ts` if needed

### Creating a New Page

1. Create file in `app/[route]/page.tsx`
2. For authenticated pages, import and use hooks from `hooks/`
3. Use React Query hooks (`useJokesQuery`, `useRoutinesQuery`) for data
4. Handle loading and error states
5. Add navigation link in `components/layout/Header.tsx` if needed

### Adding AI Functionality

1. Define system prompt in `lib/ai-prompts.ts` with guardrails
2. Create API route in `app/api/[feature]/route.ts`
3. Use OpenAI client server-side only
4. Validate inputs with `validateComedyInput()`
5. Parse JSON responses, handle markdown code blocks
6. Create hook in `hooks/useAI.ts` if needed

## Important Notes

### Data Isolation

CRITICAL: All database queries MUST be scoped by userId. Never allow users to access other users' data:

```typescript
// CORRECT
const jokes = await prisma.joke.findMany({
  where: { userId: user.id }
});

// INCORRECT - DO NOT DO THIS
const jokes = await prisma.joke.findMany(); // Returns all users' data!
```

### Migration Wizard

The app has a migration wizard (`components/migration/migration-wizard.tsx`) to migrate LocalStorage data to database. This is a one-time operation for users upgrading from the pre-database version.

### Prisma Client Singleton

Always use the singleton Prisma client from `lib/prisma.ts`:

```typescript
import prisma from "@/lib/prisma";
// NOT: import { PrismaClient } from "@prisma/client";
```

### Rate Limiting

Current implementation is in-memory (dev only). For production, consider Redis-based rate limiting. Default: 100 requests per minute per user.

### OpenAI Model

The app uses GPT-5 (configured in API routes). Model name: Check `OPENAI_API_KEY` environment variable and OpenAI client instantiation in API routes.

## File Structure Reference

```
app/
├── api/                  # 13 authenticated API routes
│   ├── auth/            # NextAuth handlers
│   ├── joke/            # AI joke operations (generate, improve, analyze)
│   ├── jokes/           # CRUD for jokes
│   ├── routine/         # AI routine operations (analyze, optimize)
│   ├── routines/        # CRUD for routines
│   ├── performance/     # Performance analysis
│   └── migrate/         # LocalStorage migration
├── auth/                # Sign-in/error pages
├── workshop/            # Structure-based joke creation
├── routines/            # Routine list
├── routine/[id]/        # Drag-and-drop routine builder
├── editor/[id]/         # Joke editor with versions
├── layout.tsx           # Root layout with providers
├── page.tsx             # Landing page
└── providers.tsx        # QueryClient + SessionProvider

components/
├── auth/                # SessionProvider, UserMenu
├── layout/              # ConditionalHeader, ConditionalMain, Header
├── migration/           # LocalStorage migration wizard
└── ui/                  # Button, Card, Input, Textarea, Badge, LoadingSpinner

hooks/
├── useJokesQuery.ts     # React Query for jokes
├── useRoutinesQuery.ts  # React Query for routines
└── useAI.ts            # AI operations client-side hook

lib/
├── types.ts            # TypeScript interfaces
├── structures.ts       # 21 comedy blueprints
├── security.ts         # Auth, validation, rate limiting
├── ai-prompts.ts       # Task-scoped system prompts
├── prisma.ts           # Prisma singleton
└── utils.ts            # Helper functions

prisma/
└── schema.prisma       # Complete database schema (9 models)
```

## Troubleshooting

### Dev Server Already Running

If `npm run dev` fails with "port already in use":
```bash
# Check what's using port 3000
lsof -i :3000

# Kill existing process if needed
kill -9 <PID>
```

### Prisma Client Out of Sync

If you see "Prisma Client is out of sync" errors:
```bash
npx prisma generate
```

### Database Connection Issues

Check `.env.local` has correct `DATABASE_URL` and `DIRECT_URL` from Supabase.

### Authentication Issues

1. Verify Google OAuth credentials in `.env.local`
2. Check authorized redirect URIs in Google Cloud Console
3. Ensure `NEXTAUTH_SECRET` is set
4. Clear browser cookies and try again

## Testing Strategy

Currently no automated tests. Manual testing recommended:

1. **Joke Creation Flow:** Workshop → Editor → Save → View on dashboard
2. **Routine Builder:** Create routine → Drag jokes → Optimize → Save
3. **AI Features:** Generate setups/punchlines, analyze weaknesses, optimize routine
4. **Authentication:** Sign in → Create data → Sign out → Sign in → Verify data persists
5. **Multi-user:** Two different Google accounts should have isolated data
