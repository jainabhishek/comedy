# ExecPlan: Structure-Based Workshop Flow Update

Reference: plans.md — this document must remain compliant with the repository plan guidelines.

## Purpose / Big Picture

After implementing this plan, comedians using the Workshop flow can first pick a joke structure (for example setup/punchline/tag or rule of three) and then receive three AI-suggested options for each part of that structure, selecting one or multiple options before saving a joke. A novice can prove success by launching the Workshop, entering a premise, choosing a structure, observing per-part suggestions, and saving a joke that records the chosen structure and parts.

## Progress

- [x] (2025-10-15T02:05Z) Captured baseline Workshop flow (steps: premise → setup → punchline → final) and noted create/save path via `useJokes.createJoke` storing jokes without structure metadata.
- [x] (2025-10-15T02:12Z) Defined reusable `JOKE_STRUCTURES`, helper lookup, and structure-aware prompt builder (`buildStructurePartPrompt`).
- [x] (2025-10-15T02:34Z) Rebuilt workshop UI with structure selection, per-part generation, custom inputs, and review/save flow.
- [x] (2025-10-15T02:40Z) Extended `useAI` and `/api/joke/generate` for structure-aware payloads. (Updated 2025-10-15T03:05Z: removed local fallbacks so OpenAI output is mandatory.)
- [ ] (2025-10-15T02:45Z) Validate end-to-end workflow and document results. Completed: `npm run lint`; Remaining: manual UI walkthrough and persistence check.

## Surprises & Discoveries

- Observation: GPT-5 requires generous `max_output_tokens` to produce final text (reasoning tokens alone exhausted smaller budgets).
  Evidence: `/api/joke/generate/route.ts` now requests 3000 tokens after incomplete responses at 600/1200 triggered “No response from AI” (2025-10-15T03:25Z).
- Observation: `npm run build` fails in the sandbox because Turbopack cannot bind to the required port.
  Evidence: Build attempt (2025-10-15T02:48Z) returned `TurbopackInternalError: Failed to write page endpoint /_error` citing “Operation not permitted (os error 1)”.

## Decision Log

- Decision: Treat each structure part as an ordered step and allow multi-select so comics can capture multiple tags.
  Rationale: Preserves flexibility while keeping state predictable for storage and editing.
  Date/Author: 2025-10-15 / agent
- Decision: Persist part labels alongside selected text in `Joke.structure` metadata.
  Rationale: Keeps saved jokes readable even if structure definitions change later.
  Date/Author: 2025-10-15 / agent
- Decision: Remove heuristic fallbacks so `/api/joke/generate` fails fast without OpenAI output.
  Rationale: Guarantees suggestions come from GPT-5 and surfaces environment issues immediately.
  Date/Author: 2025-10-15 / agent

## Outcomes & Retrospective

The workshop now walks comics from premise → structure → part-by-part generation → review, storing full structure metadata with each joke. OpenAI responses are required for suggestions; missing network access yields surfaced API errors instead of silent fallback text. Manual UX verification remains outstanding, and lint passes confirm consistency.

## Context and Orientation

The Workshop UI lives in `app/workshop/page.tsx`. AI helpers are in `hooks/useAI.ts` and `lib/ai-prompts.ts`. Joke persistence is managed by `hooks/useJokes.ts` backed by `lib/storage.ts`. API routes under `app/api/joke/` now accept structure-aware payloads. A shared structure catalogue resides in `lib/structures.ts` so both client and server use the same definitions. `/api/joke/generate` requires a valid OpenAI response—without network access it returns `ERROR_MESSAGES.API_ERROR` to surface the failure.

## Plan of Work

First, document the existing workshop steps by reading `app/workshop/page.tsx` and noting state transitions so the new structure step integrates cleanly. Next, create `lib/structures.ts` exporting an array of structure definitions including id, display name, summary, ordered parts, and per-part guidance text. Update `lib/ai-prompts.ts` to add builders that accept `{ structureId, partId, premise, priorSelections }` and produce targeted prompts. Modify `hooks/useAI.ts` to expose a `generatePartOptions` function that posts `{ structureId, partId, premise, selections }` to `/api/joke/generate`. Refactor the workshop component to add a structure selection screen, iterate through parts defined by the chosen structure, display AI suggestions (three per request) plus a custom input, allow multi-select, and store selections in state keyed by part id. Ensure the final review step summarizes all selected options and enables edits. Update `hooks/useJokes.createJoke` calls so the saved joke includes `structure` metadata with the chosen id, parts, and selected options. Adjust the API route to deserialize the new payload, load structure metadata, build prompts via the new helper, and return `{ suggestions, structureId, partId }`. Throughout, keep types in `lib/types.ts` synchronized (add interfaces for structures and joke parts) so TypeScript enforces correctness.

## Concrete Steps

1. From the repo root, run `npm run lint` to confirm the baseline is clean.
2. Inspect the existing workshop flow with `sed -n '1,200p' app/workshop/page.tsx` to document current steps in the Progress section.
3. Create `lib/structures.ts` defining structure constants and shareable types.
4. Update `lib/types.ts` with `JokeStructure`, `JokeStructurePart`, and `SelectedPartOption` interfaces.
5. Extend `lib/ai-prompts.ts` with a `buildPartPrompt(structure, part, premise, priorSelections)` function and ensure `validateComedyInput` remains compatible.
6. Refactor `hooks/useAI.ts` to add `generatePartOptions` and adjust existing callers.
7. Rewrite `app/workshop/page.tsx` state to include `currentPartIndex`, `structureId`, and part selections; implement the new UI screens with Tailwind components.
8. Update `hooks/useJokes.ts` (and storage service if needed) to persist structure metadata when saving jokes.
9. Modify `/api/joke/generate` to expect structure-aware payloads, call the new prompt builder, and respond with structured suggestions, falling back to heuristics when OpenAI fails.
10. Run `npm run lint` and any added tests (`npm run test` once created) to verify the code.
11. Manually test the workflow: `npm run dev`, visit `http://localhost:3000/workshop`, walk through the new flow, and confirm saved jokes include structure data via browser devtools (LocalStorage key `comedy-app-data`).

## Validation and Acceptance

Acceptance requires two proofs. First, automated checks: run `npm run lint` and any new unit tests (for example `npm run test`) and expect all pass. Second, manual behavior: in the Workshop, enter a premise, choose the “Rule of Three” structure, observe three generated options for each part, select multiple tags where allowed, save the joke, and verify the resulting entry on the dashboard shows the structure metadata (either via UI or inspecting LocalStorage). If OpenAI is unavailable or the call fails, the UI should surface the server’s error instead of silently generating fallback text.

Executed: `npm run lint` (2025-10-15T02:43Z) — passed. `npm run build` (2025-10-15T02:48Z) blocked by sandbox port-binding restrictions (Turbopack error). Pending: manual browser walkthrough, LocalStorage verification, and OpenAI-powered run in an environment with outbound network access.

## Idempotence and Recovery

The new structure selection and generation steps are stateless per session. Running `npm run dev` repeatedly is safe. If the structure config needs adjustment, editing `lib/structures.ts` and reloading the page suffices; no migrations are required unless Supabase integration is later enabled. If a generated joke saves incorrect structure data, delete the joke through the dashboard to reset LocalStorage.

## Artifacts and Notes

When documenting progress, capture key snippets such as the `JOKE_STRUCTURES` definition or example API payloads. Indent them here once available, for example:

    Example request payload:
    {
      "type": "structure-part",
      "structureId": "rule-of-three",
      "partId": "turn",
      "premise": "I was at an AI conference scheming to replace myself",
      "priorSelections": [
        { "partId": "premise", "selected": ["Convinced everyone automation is harmless"] },
        { "partId": "escalation", "selected": ["Promised we'd only automate Mondays"] }
      ]
    }

## Interfaces and Dependencies

Add the following TypeScript interfaces in `lib/types.ts`:

    export interface JokeStructurePart {
        id: string;
        label: string;
        description: string;
        allowsMultiple: boolean;
    }

    export interface JokeStructure {
        id: string;
        name: string;
        summary: string;
        parts: JokeStructurePart[];
    }

    export interface SelectedPartOption {
        partId: string;
        selected: string[];
        customInputs?: string[];
    }

Update `hooks/useAI` to expose:

    async function generatePartOptions(params: {
        structureId: string;
        partId: string;
        premise: string;
        priorSelections: SelectedPartOption[];
    }): Promise<string[]>;

Ensure `/api/joke/generate` accepts a JSON payload containing `structureId`, `partId`, `premise`, and `priorSelections` and returns `{ suggestions: string[], structureId: string, partId: string }`.

Revision Note (2025-10-15): Replaced the previous high-level plan with a PLANS-compliant ExecPlan after reviewing plans.md.
