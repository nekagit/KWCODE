# ADR 0104: Unit tests for src/lib/cursor-best-practice.ts

## Status

Accepted.

## Context

- `src/lib/cursor-best-practice.ts` exports `CURSOR_BEST_PRACTICE_FILES` (and type `CursorBestPracticeEntry`), used to show users which files to create when starting a project (.cursor structure, AGENTS.md, README.md, etc.).
- The module had no unit tests; changes to paths or structure could break UI or onboarding without being caught.

## Decision

- Add `src/lib/__tests__/cursor-best-practice.test.ts` with tests for:
  - `CURSOR_BEST_PRACTICE_FILES`: non-empty array; every entry has `path` (string) and optional `description` (string); key paths present (AGENTS.md, .cursor/AGENTS.md, .cursor/rules/, .cursor/adr/, README.md, etc.); no duplicate paths; folder entries end with slash.
  - `CursorBestPracticeEntry` type: entries with path-only and path+description are valid.
- No change to production code in `cursor-best-practice.ts`.

## Consequences

- Best-practice list shape and key paths are documented and regressions caught when the list is edited.
- Aligns with existing pattern: one test file per lib module (run-helpers, utils, cursor-paths, etc.).

## References

- `src/lib/cursor-best-practice.ts` — implementation
- `src/lib/__tests__/cursor-best-practice.test.ts` — new test file
- ADR 0084 — unit tests (Vitest) and night shift coverage
