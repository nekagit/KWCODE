# ADR 0097: cursor-paths — unit tests for SETUP_* constants

## Status

Accepted.

## Context

- `src/lib/cursor-paths.ts` exports SETUP_* constants (design, architecture, testing, documentation, frontend, backend doc/prompt/analysis paths) used by ProjectFrontendTab, ProjectBackendTab, ProjectTestingTab, SetupDocBlock, and related UI. ADR 0092 and 0093 added tests for roots, worker, planner, project, and getPromptPath/getOutputPath/getSetupDocPath/getSetupPromptPath, but the SETUP_* string constants were not asserted.

## Decision

- Extend `src/lib/__tests__/cursor-paths.test.ts` with a describe block "SETUP_* constants" that:
  - Asserts exact values for design, architecture, testing (doc, prompt, testing dir), frontend (json, analysis), and backend (json, analysis) paths.
  - Asserts that all listed SETUP_* paths start with PROJECT_ROOT.
- No change to `cursor-paths.ts`; tests only.

## Consequences

- Regressions or typos in SETUP_* constants are caught by Vitest. Coverage aligns with exports used by setup/project tabs.

## References

- `src/lib/cursor-paths.ts` — implementation
- `src/lib/__tests__/cursor-paths.test.ts` — SETUP_* constants tests
- ADR 0092, 0093 — cursor-paths unit test history
