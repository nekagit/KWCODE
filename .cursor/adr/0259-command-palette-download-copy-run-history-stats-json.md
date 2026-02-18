# ADR 0259: Command palette — Download and copy run history stats as JSON

## Status

Accepted.

## Context

The command palette has "Copy run history stats summary" (plain text, e.g. "42 runs, 38 passed, 4 failed, 2h 15m total") and full run history as JSON/Markdown/CSV. There was no way to export the **aggregate stats** as structured JSON—either as a file or to the clipboard—for reporting, dashboards, or tooling. Users who need machine-readable stats had to parse the plain-text summary or export the full history and compute stats elsewhere.

## Decision

- Add a small lib **`src/lib/download-run-history-stats-json.ts`** that:
  - Exports `buildRunHistoryStatsJsonPayload(entries)` returning `{ exportedAt, totalRuns, successCount, failCount, totalDurationMs, summary }` using `computeRunHistoryStats` and `formatRunHistoryStatsSummary` from `@/lib/run-history-stats`.
  - Exports `downloadRunHistoryStatsAsJson(entries)` to trigger a file download with filename `run-history-stats-{timestamp}.json`.
  - Exports `copyRunHistoryStatsAsJsonToClipboard(entries)` to copy the same JSON to the clipboard.
  - When entries are empty, show toast "No run history" and return without writing.
- Add two command palette actions: **"Download run history stats as JSON"** and **"Copy run history stats as JSON"** (after "Copy run history stats summary"), each calling the new lib with `terminalOutputHistory` from the run store.
- Document both actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export run history stats in structured JSON from ⌘K for reporting or integration.
- JSON payload is stable (totalRuns, successCount, failCount, totalDurationMs, summary, exportedAt) and easy to consume by scripts or dashboards.
- Single new lib; CommandPalette and keyboard-shortcuts get two handlers and two entries each.
