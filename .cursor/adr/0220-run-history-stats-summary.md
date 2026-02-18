# ADR 0220: Run history stats summary

## Status

Accepted.

## Context

The Run tab History section shows a table of completed runs with filters and a "Showing X of Y runs" count when filters are active, but no aggregate summary (passed/failed counts, total duration). Users had to scan the table to understand overall success rate and total time spent.

## Decision

- Introduce a small lib `src/lib/run-history-stats.ts` that:
  - Defines `RunHistoryStats` (totalRuns, successCount, failCount, totalDurationMs).
  - Exposes `computeRunHistoryStats(entries)` and `formatRunHistoryStatsSummary(stats)` for full summary text.
  - Exposes `formatRunHistoryStatsToolbar(stats)` for a compact toolbar line (e.g. "38 passed, 4 failed · 2h 15m total").
- In the Run tab History section (WorkerHistorySection), compute stats from the current **display** history (filtered and sorted) and show the compact summary in the toolbar row when there is at least one run.
- Success = exitCode === 0; all other entries (non-zero or undefined exitCode) count as failed. Duration sums only non-negative `durationMs`.

## Consequences

- Users see at-a-glance passed/failed counts and total duration for the visible (filtered) run set.
- Stats are derived from the same list as the table (displayHistory), so they stay in sync with sort and filters.
- The module is pure and testable; future use cases (e.g. dashboard widget, export summary) can reuse it.
