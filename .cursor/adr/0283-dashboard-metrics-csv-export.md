# ADR 0283 — Dashboard metrics as CSV export

## Status

Accepted.

## Context

- The app already exports dashboard metrics as JSON (Copy and Download) from the command palette (ADR 0272).
- There was no CSV export for dashboard metrics; users who need a single-row CSV for spreadsheets or tooling had to convert JSON manually.
- Other metrics (e.g. run history stats) already support CSV export; dashboard metrics CSV aligns with that pattern.

## Decision

- Add two command palette actions:
  - **Copy dashboard metrics as CSV** — fetches metrics via `getDashboardMetrics()`, builds a single-row CSV (header: exportedAt, tickets_count, prompts_count, designs_count, active_projects_count, all_projects_count), copies to clipboard, shows success toast.
  - **Download dashboard metrics as CSV** — same CSV; triggers file download with filename `dashboard-metrics-{timestamp}.csv` using `filenameTimestamp()` and `downloadBlob()` from download-helpers.
- Implement in a new lib module:
  - `src/lib/download-dashboard-metrics-csv.ts` — `buildDashboardMetricsCsv()`, `downloadDashboardMetricsAsCsv()`, `copyDashboardMetricsAsCsvToClipboard()`; reuses `escapeCsvField` from csv-helpers and `getDashboardMetrics` from api-dashboard-metrics.
- Register both actions in the command palette (after dashboard metrics JSON entries); add entries to `keyboard-shortcuts.ts` for the Command palette group.

## Consequences

- Users can export dashboard metrics as CSV from the command palette (⌘K) for use in spreadsheets or scripts.
- CSV format is a single header row plus one data row; consistent with run history stats CSV and other single-row exports.
- No new UI; minimal touch to CommandPalette (imports, two handlers, two entries) and keyboard-shortcuts (two descriptions).
