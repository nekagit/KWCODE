# ADR 0196: Unit tests for api-dashboard-metrics

## Status

Accepted.

## Context

The dashboard metrics API module (`src/lib/api-dashboard-metrics.ts`) exposes `getDashboardMetrics()` with dual-mode behaviour: Tauri uses `invoke("get_dashboard_metrics", {})`, browser uses `GET /api/data/dashboard-metrics`. The module had no unit tests, so regressions in branch selection or error handling were not caught by the test suite.

## Decision

- Add a dedicated Vitest test file: **`src/lib/__tests__/api-dashboard-metrics.test.ts`**.
- Mock `@/lib/tauri` (`invoke`, `isTauri`) and, for the browser branch, global `fetch`.
- Cover:
  - **Tauri branch**: when `isTauri` is true, `invoke` is called with the correct command/args and the returned metrics are passed through.
  - **Fetch branch (ok)**: when `isTauri` is false and `fetch` returns an ok response, `getDashboardMetrics()` returns the parsed JSON body.
  - **Fetch branch (!ok)**: when the response is not ok, `getDashboardMetrics()` throws with the response text.
  - **Tauri error**: when `invoke` rejects, the error is propagated to the caller.
- Follow existing project patterns: `vi.mock`, `beforeEach`/`afterEach`, clear assertions; no testing of implementation details beyond the public contract.

## Consequences

- Dashboard metrics API behaviour is documented by tests and protected against regressions.
- Dual-mode and error paths are explicitly covered; future changes to the module can be validated with `npm run test`.
- Aligns with the project’s test-phase focus and the convention of colocating lib tests in `src/lib/__tests__/`.
