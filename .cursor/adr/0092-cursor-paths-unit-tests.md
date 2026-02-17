# ADR 0092: Unit tests for src/lib/cursor-paths.ts

## Status

Accepted.

## Context

- `src/lib/cursor-paths.ts` is the single source of truth for `.cursor` entity paths (0. ideas, 1. project, 7. planner, 8. worker, 2. agents) and analyze job prompt/output paths. It is used by run/analyze flows and worker prompts.
- The module had no unit tests; refactors or typos in path constants could go unnoticed.

## Decision

- Add `src/lib/__tests__/cursor-paths.test.ts` with tests for:
  - Constants: roots (IDEAS_ROOT, PROJECT_ROOT, PLANNER_ROOT), worker/agents paths, ANALYZE_JOB_IDS order, planner and ideas doc paths.
  - `getPromptPath(id)`: each AnalyzeJobId returns the correct prompt path; unknown id (default branch) returns empty string.
  - `getOutputPath(id)`: each AnalyzeJobId returns the correct output path; unknown id returns empty string.
  - `getSetupDocPath(key)` and `getSetupPromptPath(key)`: ideas vs. other keys (design, architecture, testing, documentation).
- No change to production code in `cursor-paths.ts`.

## Consequences

- Path semantics are documented and regressions caught when paths or analyze job ids change.
- Aligns with existing pattern: one test file per lib module (run-helpers, utils, cursor-paths).

## References

- `src/lib/cursor-paths.ts` — implementation
- `src/lib/__tests__/cursor-paths.test.ts` — new test file
- ADR 0084 — unit tests (Vitest) and night shift coverage
