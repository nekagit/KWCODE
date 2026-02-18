# ADR 0261: Run tab — Download and Copy run history stats as JSON in History toolbar

## Status

Accepted.

## Context

The command palette (⌘K) already offers "Download run history stats as JSON" and "Copy run history stats as JSON" for aggregate stats (totalRuns, successCount, failCount, totalDurationMs, summary). The Run tab History section shows the same stats in the toolbar (e.g. "38 passed, 4 failed · 2h 15m total") and has Copy last run, Download last run, Copy all, Download all, etc., but no direct way to export those stats as JSON from the Run page. Users had to open the command palette to get stats as JSON.

## Decision

- In **ProjectRunTab.tsx** (History section toolbar), add two buttons after "Download last run" and before "Copy all":
  - **"Download stats as JSON"** — calls `downloadRunHistoryStatsAsJson(displayHistory)` from `@/lib/download-run-history-stats-json`.
  - **"Copy stats as JSON"** — calls `copyRunHistoryStatsAsJsonToClipboard(displayHistory)` from the same lib.
- Use **displayHistory** (the visible/filtered list) so the exported stats match what the user sees on screen.
- Both buttons are disabled when `displayHistory.length === 0`. Use the same styling as existing History toolbar buttons (ghost, sm, FileJson icon).

## Consequences

- Users can export run history stats as JSON from the Run tab without opening the command palette.
- Stats in the exported JSON reflect the currently filtered/sorted history (displayHistory), consistent with the Run tab UI.
- Single touch to ProjectRunTab; no new lib (reuses download-run-history-stats-json).
