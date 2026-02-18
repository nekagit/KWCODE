# ADR 0144: Dashboard "Last refreshed" timestamp

## Status

Accepted.

## Context

The Home page Dashboard tab has a "Refresh data" button and loading state (ADR 0141, 0142) but no indication of when app data (projects, prompts) was last successfully loaded. Users could not tell if the displayed metrics and project list were current or stale.

## Decision

- **Run store**: Add `lastRefreshedAt: number | null` (timestamp in ms) to the run store state. When `refreshData()` completes successfully (both Tauri and browser paths), set `lastRefreshedAt` to `Date.now()`. On error, leave it unchanged (previous value or null).
- **Format helper**: New lib `src/lib/format-relative-time.ts` exports `formatRelativeTime(ts: number): string` — returns "just now", "2 min ago", "1 h ago", "2 days ago" (English, non-localized) for consistent "X ago" display.
- **Dashboard UI**: In `DashboardTabContent`, when `lastRefreshedAt` is non-null, show muted text next to the Refresh button: "Last refreshed: {formatRelativeTime(lastRefreshedAt)}". The value is set after the first successful load (e.g. from run-store hydration) and after each manual refresh.

## Consequences

- Users see when data was last loaded without leaving the Dashboard.
- Single source for relative time formatting; can be reused elsewhere (e.g. Configuration or other "last updated" labels).
- No live tick (e.g. "1 min ago" does not auto-update to "2 min ago"); user can refresh again to see an updated timestamp.
