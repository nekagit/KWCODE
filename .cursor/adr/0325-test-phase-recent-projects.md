# ADR 0325 — Test phase: Unit tests for recent-projects

## Status

Accepted.

## Context

- The `recent-projects.ts` module provides `getRecentProjectIds()` and `recordProjectVisit(projectId)` for command-palette ordering: it persists the last N (10) recently visited project IDs in localStorage (most recent first).
- The module had no unit tests. SSR-safe behaviour (window undefined), localStorage parsing (invalid JSON, non-array, non-string elements), dedupe/max-cap and trim behaviour were undocumented and at risk of regression.

## Decision

1. **Add unit tests**
   - Add `src/lib/__tests__/recent-projects.test.ts` covering:
     - **getRecentProjectIds:** returns [] when window is undefined (SSR); returns [] when key missing or invalid JSON or stored value not an array; returns only string elements, capped at MAX_RECENT (10); returns valid string array when storage has valid JSON array.
     - **recordProjectVisit:** no-op when window undefined or projectId empty/whitespace; prepends and dedupes; trims projectId; caps at MAX_RECENT and persists to localStorage.

2. **No production code changes**
   - `recent-projects.ts` remains unchanged; tests document and guard existing behaviour.

## Consequences

- Recent-projects behaviour is documented and regression-safe.
- Same test-phase pattern as parse-first-remote-url, copy-app-version, and print-page.
- No new dependencies; Vitest only. Tests use a small in-memory mock storage (no vi.fn() on localStorage) for clear assertions.
