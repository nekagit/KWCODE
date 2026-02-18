# ADR 0179: Dashboard tab — "Last refreshed" tooltip with exact timestamp

## Status

Accepted.

## Context

The Dashboard tab shows "Last refreshed: 2 min ago" (relative time via `formatRelativeTime`). Hover and assistive technology had no way to see the exact date and time of the last refresh. The run history table already uses `formatTimestampFull` for timestamp cell tooltips (ADR 0171); the Dashboard should follow the same pattern for consistency and accessibility.

## Decision

- **DashboardTabContent.tsx**: Add a `title` attribute on the "Last refreshed" span with the full locale-aware timestamp. Use `formatTimestampFull(new Date(lastRefreshedAt).toISOString())` from `@/lib/format-timestamp` so the value matches the existing run history tooltip format.
- No new lib or store; reuse `formatTimestampFull` from `format-timestamp.ts`.

## Consequences

- Users see the exact date and time of the last refresh on hover over "Last refreshed".
- Screen readers and other assistive tech can expose the full timestamp via the title.
- Aligns with the run history timestamp tooltip pattern (ADR 0171).
