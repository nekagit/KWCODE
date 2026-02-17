# ADR 0090: Night shift — utils unit tests implemented

## Status

Accepted.

## Context

- ADR 0089 decided to add unit tests for `src/lib/utils.ts`.
- Night shift run (no ticket) chose "improving tests" as the next valuable task.

## Decision

- Implemented `src/lib/__tests__/utils.test.ts` with Vitest tests for:
  - **humanizeAgentId** — kebab-case, snake_case, single word, mixed separators, empty string.
  - **normalizePath** — backslash to forward slash, forwards unchanged, mixed, empty.
  - **scatter** — output in [0, 1), concrete values and range check.
  - **formatDate** — valid ISO formatted, invalid/empty return original string.
  - **getApiErrorMessage** — JSON `error`/`detail`, "Internal Server Error" → friendly message, status text fallback, 500 empty body.
- No change to production code in `utils.ts`.

## Consequences

- Utils behavior is regression-protected; same pattern as `run-helpers.test.ts`.

## References

- ADR 0089 — unit tests for utils (decision)
- `src/lib/utils.ts` — implementation
- `src/lib/__tests__/utils.test.ts` — new test file
