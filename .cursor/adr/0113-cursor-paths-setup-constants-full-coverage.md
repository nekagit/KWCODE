# ADR 0113: cursor-paths — full test coverage for all SETUP_* constants

## Status

Accepted.

## Context

- ADR 0097 added unit tests for SETUP_* constants in `src/lib/__tests__/cursor-paths.test.ts`, but not every exported SETUP_* constant had an explicit value assertion or was included in the "all SETUP_* paths start with PROJECT_ROOT" list.
- Missing from tests: SETUP_ARCHITECTURE_PROMPT_PATH, SETUP_TESTING_PROMPT_PATH, SETUP_DOCUMENTATION_DOC_PATH, SETUP_DOCUMENTATION_PROMPT_PATH, SETUP_FRONTEND_PROMPT_PATH, SETUP_BACKEND_PROMPT_PATH.

## Decision

- Extend `src/lib/__tests__/cursor-paths.test.ts` so that:
  - Every SETUP_* constant is imported and asserted (exact path and/or inclusion in the PROJECT_ROOT check).
  - Add "setup documentation paths are under 1. project" with exact values for SETUP_DOCUMENTATION_DOC_PATH and SETUP_DOCUMENTATION_PROMPT_PATH.
  - Extend "setup design, architecture, testing" to include SETUP_ARCHITECTURE_PROMPT_PATH and SETUP_TESTING_PROMPT_PATH.
  - Extend "setup frontend and backend" to include SETUP_FRONTEND_PROMPT_PATH and SETUP_BACKEND_PROMPT_PATH.
  - Include all 15 SETUP_* constants in the "all SETUP_* paths start with PROJECT_ROOT" array.
- No change to `src/lib/cursor-paths.ts`; tests only.

## Consequences

- Any future SETUP_* constant can be added to the same test list; regressions or typos are caught. Full parity between cursor-paths exports and test coverage for SETUP_*.

## References

- `src/lib/cursor-paths.ts` — implementation
- `src/lib/__tests__/cursor-paths.test.ts` — SETUP_* constants tests
- ADR 0097 — cursor-paths SETUP_* constants tests
