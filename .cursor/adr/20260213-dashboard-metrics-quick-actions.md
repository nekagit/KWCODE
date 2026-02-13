# ADR: Dashboard with metrics and quick actions

## Date
2026-02-13

## Status
Accepted

## Context
Ticket #2 requested a user-friendly dashboard that displays key metrics and provides quick action buttons for common tasks. The app already had a Dashboard tab on the home page (`DashboardTabContent`) showing a ticket board; it did not show aggregated metrics or a visible quick-actions section. QuickActions organism existed but rendered an empty card.

## Decision
- **Backend (Tauri):** Add a single command `get_dashboard_metrics` that returns aggregated counts in one round-trip: `tickets_count`, `features_count`, `prompts_count`, `designs_count`, `active_projects_count`, `all_projects_count`. Implemented in `lib.rs` by reusing existing `db::get_*` functions and returning a `DashboardMetrics` struct (Serialize/Deserialize). No new db module functions; counts derived from existing queries.
- **Backend (browser fallback):** Add GET `/api/data/dashboard-metrics` that returns the same shape. Reuses the same data sources as the main data route (`.cursor/` files and `parseTicketsMd` / `parseFeaturesMd`) and returns counts only. On error, returns zero counts and an `error` field with status 200 to avoid breaking the dashboard.
- **Frontend types:** Add `src/types/dashboard.ts` with `DashboardMetrics` interface aligned with Rust and API.
- **Dashboard UI:** Add a metrics section at the top of the Dashboard tab using a new molecule `DashboardMetricsCards`, which fetches via `invoke("get_dashboard_metrics")` (Tauri) or `fetch("/api/data/dashboard-metrics")` (browser). Display six metric cards in a responsive grid (Tickets, Features, Prompts, Designs, Active projects, All projects) with icons and theme-aware styling; show skeleton while loading and an error state on failure. Restore quick actions by wiring `QuickActionButtons` inside `QuickActionCard` in the `QuickActions` organism and passing `runningRuns`, `features`, `navigateToTab`, `runForFeature`, `setSelectedRunId` from `DashboardTabContent`. Layout order: Metrics → Quick actions → Ticket board.
- **No new routes or nav:** Dashboard remains the first tab on the home page; no new app routes or sidebar entries.

## Consequences
- Users see at a glance how many tickets, features, prompts, designs, and projects they have, and can use quick actions (e.g. Add ticket, Run feature, Prompts, Active repos, Feature tab, View log) without leaving the dashboard.
- One Tauri command and one API route keep metrics in sync with the existing data layer and support dual-mode (desktop and browser).
- Dashboard is more intuitive and visually structured; future metrics (e.g. running runs count, last run time) can be added to the same command and cards.
