# ADR 0249: Command palette — Copy run history stats summary

## Status

Accepted.

## Context

The command palette has "Copy run history to clipboard" (full content of all runs) and "Copy last run to clipboard" (single run). There was no way to copy only the **aggregate stats** (e.g. "42 runs, 38 passed, 4 failed, 2h 15m total") from ⌘K. The Run tab already shows this summary in the toolbar via `run-history-stats.ts`. Users wanted a one-paste summary for reports or chat without copying full history.

## Decision

- Add a command palette action **"Copy run history stats summary"** that:
  - Reads `terminalOutputHistory` from the run store (same source as "Copy run history").
  - Computes stats with `computeRunHistoryStats` and formats with `formatRunHistoryStatsSummary` from `@/lib/run-history-stats`.
  - Copies the one-line summary to the clipboard and shows success/empty toast.
- New lib **`src/lib/copy-run-history-stats-summary.ts`**: export `copyRunHistoryStatsSummaryToClipboard(entries)`. Reuse existing run-history-stats; use `copyTextToClipboard` from copy-to-clipboard; toast "No run history" when entries are empty.
- Document the action in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can copy run history stats (runs, passed, failed, total duration) from ⌘K in one action.
- Summary format matches the Run tab toolbar, so behavior is consistent.
- Single new lib; CommandPalette and shortcuts get one handler and one entry each.
