# ADR 112: Zod request validation for API routes

## Status
Accepted

## Context
- Ticket #3 (API security & validation): Request bodies were not validated; malformed input could cause 500s.
- generate and data API routes accept JSON; some had manual type checks, others could throw on invalid input.

## Decision

1. **Add Zod dependency**
   - `npm install zod` for runtime request validation.

2. **Shared api-validation module (`src/lib/api-validation.ts`)**
   - Schemas: `generatePromptSchema`, `generateTicketsSchema`, `generateIdeasSchema`, `generateDesignSchema`, `createProjectSchema`, `createPromptSchema`, etc.
   - Helper: `parseAndValidate(request, schema)` returns `{ success, data }` or `{ success: false, response: NextResponse }` with 400 and validation details.

3. **Routes updated**
   - `generate-prompt`, `generate-tickets`, `generate-ideas`, `generate-design`, `data/projects` POST, `data/prompts` POST.
   - Replaced manual `await request.json()` + type checks with `parseAndValidate(request, schema)`.

## Consequences
- Malformed JSON or invalid fields return 400 with a clear message instead of 500.
- Validation logic is centralized and reusable.
- Additional routes (architectures, designs, ideas, generate-architectures, generate-project-from-idea, generate-prompt-from-kanban) can be migrated incrementally.