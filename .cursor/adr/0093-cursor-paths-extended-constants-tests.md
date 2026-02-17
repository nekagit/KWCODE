# ADR 0093: cursor-paths — extended constants coverage in unit tests

## Status

Accepted.

## Context

- ADR 0092 introduced `src/lib/__tests__/cursor-paths.test.ts` for `cursor-paths.ts`. Initial tests covered roots, worker implement-all/night-shift, agents, ANALYZE_JOB_IDS, planner tickets path, ideas paths, and getPromptPath/getOutputPath/getSetupDocPath/getSetupPromptPath.
- Several exported constants used by the app were not asserted: `WORKER_FIX_BUG_PROMPT_PATH`, `PLANNER_FEATURES_PATH`, `PLANNER_KANBAN_STATE_PATH`, `PROJECT_DIR`, `PROJECT_OUTPUT_PATH`. A refactor or typo in these could break Run tab or planner/project UI without test failure.

## Decision

- Extend `cursor-paths.test.ts` to cover:
  - **Worker:** `WORKER_FIX_BUG_PROMPT_PATH` contains `.cursor` and `fix-bug.md`.
  - **Planner:** `PLANNER_FEATURES_PATH` and `PLANNER_KANBAN_STATE_PATH` equal `.cursor/7. planner/features.md` and `.cursor/7. planner/kanban-state.json`.
  - **Project:** `PROJECT_DIR` equals `PROJECT_ROOT`; `PROJECT_OUTPUT_PATH` equals `.cursor/1. project/PROJECT-INFO.md`.
- No change to `cursor-paths.ts`; tests only.

## Consequences

- Regressions in fix-bug prompt path, planner paths, or project paths are caught by Vitest.
- Keeps cursor-paths test coverage aligned with all main exports used by the app.

## References

- `src/lib/cursor-paths.ts` — implementation
- `src/lib/__tests__/cursor-paths.test.ts` — extended tests
- ADR 0092 — initial cursor-paths unit tests
