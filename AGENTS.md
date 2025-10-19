# Repository Guidelines

## Project Structure & Module Organization

- `app/` holds the Next.js App Router pages, API routes, and feature flows (`workshop`, `dashboard`, `routines`).
- `components/` contains reusable UI primitives (buttons, cards, badges) and layout shells.
- `hooks/` exposes domain hooks (`useJokes`, `useRoutines`, `useAI`) that mediate storage and AI calls.
- `lib/` bundles cross-cutting utilities (prompt builders, storage service, type definitions) plus Prisma helpers under `lib/prisma`.
- `prisma/` stores the schema and migrations for the Supabase/Postgres backend.
- `docs/` aggregates planning notes; keep feature plans here for discovery.
- Static assets live in `public/`; global styling is managed in `app/globals.css`.

## Build, Test, and Development Commands

- `npm run dev` — start the Next.js dev server at `http://localhost:3000`.
- `npm run build` — create an optimized production build; runs linting by default.
- `npm run start` — serve the production build locally.
- `npm run lint` — execute ESLint using the repo’s config.
- `npm run format` / `npm run format:check` — format with Prettier or verify formatting only.

## Coding Style & Naming Conventions

- TypeScript everywhere; keep files suffixed with `.ts` / `.tsx` and favor named exports for shared utilities.
- Use two-space indentation and rely on Prettier (`npm run format`) plus ESLint for enforcement.
- Name React components in PascalCase (`WorkshopPage`), hooks in camelCase with a `use` prefix (`useJokes`), and constants in SCREAMING_SNAKE case when shared.
- Tailwind utility classes drive styling; prefer composing utilities over custom CSS unless necessary.

## Testing Guidelines

- Jest/RTL scaffolding is not yet present—add tests alongside new modules under `__tests__/` or colocated `*.test.ts(x)` files when introducing logic.
- Target AI prompt helpers, storage utilities, and complex hooks for unit coverage; mock browser APIs (`localStorage`) as needed.
- Run `npm run test` once added; document additional test scripts in `package.json` when you create them.

## Commit & Pull Request Guidelines

- Write commits in imperative present tense (e.g., `Add structure selector to workshop`).
- Group related changes; avoid mixing formatting-only edits with feature work.
- Pull requests should include: concise summary, testing notes (`npm run lint`, manual QA), screenshots or GIFs for UI changes, and links to tracked issues.
- Draft PRs early when collaborating so teammates can review plans (`docs/` updates, mockups, or screenshots).

## Security & Configuration Tips

- Never commit secrets; load `OPENAI_API_KEY`, Supabase URLs, and OAuth keys via `.env.local` (gitignored).
- Guard new API routes with the existing `validateComedyInput` patterns to prevent off-topic prompts.
- When touching Prisma schema, run `npx prisma migrate dev` locally and document migration impact in the PR description.
