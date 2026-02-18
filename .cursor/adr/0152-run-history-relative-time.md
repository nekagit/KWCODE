# ADR 0152: Run history — show relative time next to timestamp

## Status

Accepted.

## Context

The Run tab History table shows only the absolute timestamp (e.g. "2/18/25, 3:45:12 PM") for each completed run. Users had to mentally parse the date to know how recent a run was. The app already has a relative-time formatter (`formatRelativeTime` in `@/lib/format-relative-time`) used on the Dashboard for "Last refreshed" (e.g. "just now", "2 min ago", "1 h ago"). Reusing it in the Run history would give at-a-glance recency without changing data or persistence.

## Decision

- In **ProjectRunTab** (Run tab History section), show the existing absolute timestamp as primary and append the relative time in muted styling, e.g. "2/18/25, 3:45:12 PM (2 min ago)".
- Reuse **`formatRelativeTime(ms)`** from `@/lib/format-relative-time`; parse each history entry's `timestamp` string with `new Date(h.timestamp).getTime()` and only show relative when the result is finite.
- Introduce a small helper **`formatTimeWithRelative(iso: string)`** in the same component that returns the absolute formatted time and, when valid, a trailing span with the relative phrase. Invalid timestamps fall back to absolute-only (same as current `formatTime` behavior).
- No new files beyond the ADR; no changes to run store, types, or API.

## Consequences

- Users can quickly see how recent each run was from the History table without opening a run or parsing the date.
- Same relative-time wording as Dashboard ("just now", "X min ago", "X h ago", "X days ago"); no localization.
- Single touch to `ProjectRunTab.tsx` (import + helper + one table cell); no new dependencies.
