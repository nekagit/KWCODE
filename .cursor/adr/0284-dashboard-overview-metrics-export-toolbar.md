# ADR 0284 — Dashboard overview metrics export toolbar

## Status

Accepted.

## Context

- Dashboard metrics (tickets_count, prompts_count, designs_count, active_projects_count, all_projects_count) can be exported via the command palette (Copy/Download as JSON and CSV; ADRs 0272, 0283).
- The Dashboard overview hero shows these stats but had no inline export actions; users had to open the command palette to export from the overview.
- RunHistoryStatsCard already provides inline Copy/Download JSON and CSV buttons; the same pattern on the Dashboard overview gives one-click export from the overview.

## Decision

- Add a compact **metrics export toolbar** in the Dashboard overview hero (Overview section), below the stat items:
  - Four buttons: **Copy as JSON**, **Download as JSON**, **Copy as CSV**, **Download as CSV**.
  - Reuse existing libs: `copyDashboardMetricsToClipboard`, `downloadDashboardMetricsAsJson` from `@/lib/copy-dashboard-metrics` and `@/lib/download-dashboard-metrics-json`; `copyDashboardMetricsAsCsvToClipboard`, `downloadDashboardMetricsAsCsv` from `@/lib/download-dashboard-metrics-csv`.
  - Use the same button style as RunHistoryStatsCard: `variant="outline"`, `size="sm"`, with FileJson/FileSpreadsheet icons.
- Implement in `src/components/molecules/DashboardsAndViews/DashboardOverview.tsx` only; no new modules. Toolbar is a separate row with a light border separator below the stats.

## Consequences

- Users can export dashboard metrics directly from the Overview hero without opening the command palette.
- UX is consistent with Run history stats card and other inline export toolbars.
- No new routes or store changes; minimal touch to DashboardOverview (one toolbar block and existing import usage).
