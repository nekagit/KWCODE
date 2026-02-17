# ADR 0108: cursor-paths — unit test for PROJECT_PROMPT_PATH

## Status

Accepted.

## Context

- `cursor-paths.ts` exports `PROJECT_PROMPT_PATH` (`.cursor/1. project/project.prompt.md`), used as the canonical path for the project prompt. ADR 0093 extended coverage for other project/planner/worker constants; `PROJECT_PROMPT_PATH` was not included in the test assertions.
- Night shift task: improve tests by extending coverage for exported constants that could regress on refactor.

## Decision

- Add a unit test in `src/lib/__tests__/cursor-paths.test.ts` that:
  - Imports `PROJECT_PROMPT_PATH`.
  - Asserts `PROJECT_PROMPT_PATH === ".cursor/1. project/project.prompt.md"` and that it starts with `PROJECT_ROOT`.
- No change to `cursor-paths.ts`; tests only.

## Consequences

- Regressions in the project prompt path are caught by Vitest.
- Keeps cursor-paths test coverage aligned with all main project-root exports.

## References

- `src/lib/cursor-paths.ts` — implementation
- `src/lib/__tests__/cursor-paths.test.ts` — test
- ADR 0093 — extended constants coverage
