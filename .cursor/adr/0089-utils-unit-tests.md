# ADR 0089: Unit tests for src/lib/utils.ts

## Status

Accepted.

## Context

- Night shift workers pick "improving tests" when no TODOs or docs tasks are pending (see `.cursor/8. worker/night-shift.md`).
- `src/lib/utils.ts` exposes pure helpers used across the app (`humanizeAgentId`, `scatter`, `normalizePath`, `formatDate`, `getApiErrorMessage`) but had no unit tests.
- Only `src/lib/run-helpers.ts` was covered by tests (`run-helpers.test.ts`).

## Decision

- Add `src/lib/__tests__/utils.test.ts` with Vitest tests for:
  - **humanizeAgentId** — kebab-case, snake_case, single word, mixed separators, empty string.
  - **scatter** — output in [0, 1), variation with different prime/mod.
  - **normalizePath** — backslash to forward slash, unchanged forwards, mixed.
  - **formatDate** — valid ISO formatted, invalid/empty return original string.
  - **getApiErrorMessage** — JSON `error`/`detail`, "Internal Server Error" → friendly message, status text fallback, 500 empty body.
- No change to production code in `utils.ts`.

## Consequences

- Regressions in utils are caught by tests.
- Same pattern as run-helpers: one test file per lib module under `src/lib/__tests__/`.
- Night shift can extend coverage for other `src/lib` modules in future runs.

## References

- `src/lib/utils.ts` — implementation
- `src/lib/__tests__/utils.test.ts` — new test file
- `.cursor/8. worker/night-shift.md` — task preference (improving tests)
