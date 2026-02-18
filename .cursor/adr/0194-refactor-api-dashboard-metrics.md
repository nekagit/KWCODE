# ADR 0194: Refactor — Dashboard metrics API module

## Status

Accepted.

## Context

Dashboard metrics (counts for tickets, prompts, designs, active/all projects) are fetched in dual mode: Tauri uses `invoke("get_dashboard_metrics", {})`, browser uses GET `/api/data/dashboard-metrics`. The same logic was duplicated in two components: `DashboardOverview.tsx` and `DashboardMetricsCards.tsx`, each with a local `fetchMetrics()` that repeated the `if (isTauri) return invoke(...); else fetch(...)` pattern. This duplicated the contract and made future changes (e.g. error handling or URL) require edits in two places.

## Decision

- Add a single API module **`src/lib/api-dashboard-metrics.ts`** that exports **`getDashboardMetrics(): Promise<DashboardMetrics>`**. Implementation: when `isTauri`, return `invoke<DashboardMetrics>("get_dashboard_metrics", {})`; otherwise GET `/api/data/dashboard-metrics` with the same error handling as before (`!res.ok` → throw with response text, then `res.json()`).
- **DashboardOverview.tsx**: Remove local `fetchMetrics`; import and use `getDashboardMetrics` from `@/lib/api-dashboard-metrics` (e.g. in the existing `Promise.all([getDashboardMetrics(), listProjects()])` pattern).
- **DashboardMetricsCards.tsx**: Remove local `fetchMetrics`; import and use `getDashboardMetrics` from `@/lib/api-dashboard-metrics`.

## Consequences

- One place defines how dashboard metrics are loaded in Tauri vs browser; behaviour unchanged.
- Both dashboard UI components depend on the shared module instead of inlining the dual-mode logic.
- Future changes to the dashboard-metrics contract (URL, error handling, or response shape) are done in one file.
- Aligns with the pattern used in `api-projects.ts` (single module for a given API surface).
