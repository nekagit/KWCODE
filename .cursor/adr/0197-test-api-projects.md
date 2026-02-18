# ADR 0197: Unit tests for api-projects

## Status

Accepted.

## Context

The projects API module (`src/lib/api-projects.ts`) exposes dual-mode behaviour via `tauriOrFetch`: Tauri uses `invoke(cmd, args)`, browser uses `fetch` to `/api/data/projects/*`. Exported functions include `getProjectResolved`, `listProjects`, `createProject`, `updateProject`, `deleteProject`, `getProjectExport`, and `getFullProjectExport`. The module had no unit tests, so regressions in branch selection, request shape, or error handling were not caught by the test suite.

## Decision

- Add a dedicated Vitest test file: **`src/lib/__tests__/api-projects.test.ts`**.
- Mock `@/lib/tauri` (`invoke`, `isTauri`) and, for the browser branch, global `fetch`.
- Cover:
  - **Tauri branch**: for each tested function, when `isTauri` is true, `invoke` is called with the correct command/args and the returned value is passed through.
  - **Fetch branch (ok)**: when `isTauri` is false and `fetch` returns an ok response, the function returns the parsed JSON (or string for export endpoints).
  - **Fetch branch (!ok)**: when the response is not ok, the function throws with the appropriate message (JSON error field or response text).
  - **Error propagation**: when `invoke` rejects, the error is propagated to the caller.
- Follow existing project patterns: `vi.mock`, `beforeEach`/`afterEach`, dynamic import of the module under test so mocks apply; align with `api-dashboard-metrics.test.ts` style.

## Consequences

- Projects API dual-mode behaviour is documented by tests and protected against regressions.
- Request URLs, methods, and bodies for the fetch branch are asserted; Tauri command/args are asserted for the invoke branch.
- Future changes to `api-projects` can be validated with `npm run test`; aligns with the project's test-phase focus and the convention of colocating lib tests in `src/lib/__tests__/`.
