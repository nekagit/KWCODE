# ADR 0141 — Dashboard tab: Refresh data button

## Status

Accepted.

## Context

The Home page Dashboard tab shows metrics and recent projects but had no way to refresh app data (projects, prompts) from that view. Users had to open the Command palette or go to another page to trigger a refresh. Other tabs (e.g. Projects, Prompts) benefit from refreshed data after it is loaded elsewhere.

## Decision

- In **DashboardTabContent**, add a **Refresh data** button (RefreshCw icon) in a small toolbar above the dashboard content. On click, call `refreshData()` from the run store (`useRunState()`). No new lib or Tauri command; reuse existing store action.
- Button: outline, small; aria-label "Refresh data (projects, prompts)", title "Refresh projects and prompts from app data". Placed top-right of the Dashboard tab content.

## Consequences

- Users can refresh projects and prompts from the Dashboard without opening the Command palette or leaving the Home page.
- Aligns with the existing "Refresh data" action in the Command palette; same behaviour, additional entry point.
