# ADR 0283 — Run history stats as CSV export

## Status

Accepted.

## Context

- Run history aggregate stats (total runs, success count, fail count, total duration) are already exported as JSON (download and copy) and shown in the Dashboard Run history card and Run tab toolbar (ADRs 0255, 0260, 0263).
- Full run history (per-run rows) is exported as CSV (download and copy) from the same surfaces.
- There was no CSV export for the **aggregate stats** (single-row summary), which is useful for spreadsheets and for combining with other CSV data.

## Decision

- Add **run history stats as CSV** export: one header row plus one data row with columns `exportedAt`, `totalRuns`, `successCount`, `failCount`, `totalDurationMs`, `summary`.
- **New lib:** `src/lib/download-run-history-stats-csv.ts` with `buildRunHistoryStatsCsv`, `downloadRunHistoryStatsAsCsv`, and `copyRunHistoryStatsAsCsvToClipboard`; reuse `computeRunHistoryStats` and `formatRunHistoryStatsSummary` from `run-history-stats`, and `escapeCsvField` from `csv-helpers`.
- **Command palette:** Add "Download run history stats as CSV" and "Copy run history stats as CSV" (after the existing stats JSON actions).
- **Run history stats card (Dashboard):** Add "Download stats as CSV" and "Copy stats as CSV" buttons.
- **Run tab (History toolbar):** Add "Download stats as CSV" and "Copy stats as CSV" buttons.
- **Keyboard shortcuts doc:** List the two new command-palette actions.

## Consequences

- Users can export run history stats as CSV from the command palette, Dashboard Run history card, and Run tab, consistent with stats JSON and full run history CSV.
- Single-row CSV is easy to open in Excel/Sheets or append to other CSV exports.
- Filename for download: `run-history-stats-{timestamp}.csv` (same timestamp pattern as stats JSON).
