# ADR 0142 — Dashboard tab: Refresh data loading state

## Status

Accepted.

## Context

The Dashboard tab has a "Refresh data" button (ADR 0141) that calls `refreshData()`. Without visual feedback during the request, users could not tell whether a refresh was in progress or had stalled. Configuration and Documentation pages already show a spinner and disable the refresh button while loading.

## Decision

- In **DashboardTabContent**, add local state `refreshing` (useState). On Refresh click: set `refreshing` true, await `refreshData()`, show toast on success or error, set `refreshing` false in a `finally` block.
- Button: disabled when `refreshing` is true; show Loader2 (animate-spin) instead of RefreshCw while loading. Same pattern as ConfigurationPageContent and DocumentationPageContent handleRefresh.

## Consequences

- Users see clear feedback when a refresh is in progress (spinner, disabled button).
- Consistent UX with other refresh actions in the app.
