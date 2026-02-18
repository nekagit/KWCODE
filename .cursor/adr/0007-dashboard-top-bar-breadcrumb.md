# ADR 0007: Dashboard top bar breadcrumb reflects current tab

## Status

Accepted. Implemented 2025-02-18.

## Context

On the Dashboard page (`/`), the top bar (breadcrumb row) always showed "Dashboard" regardless of the selected tab (`?tab=dashboard|projects|prompts|all|data`). The document title (browser tab) was already correct via `DashboardTitleSync` and `DASHBOARD_TAB_TITLES` in page-title-context. Other pages (e.g. Projects list) use two-level breadcrumbs (e.g. "Dashboard > Projects"). The mismatch made the breadcrumb misleading when viewing Projects, Prompts, Database, or Data tabs from the home page.

## Decision

- **Single source of truth for tab labels**
  - Exported `DASHBOARD_TAB_TITLES` from `page-title-context.tsx` so both document title and breadcrumb use the same mapping (dashboard → "Dashboard", projects → "Projects", prompts → "Prompts", all → "Database", data → "Data").

- **Dynamic breadcrumb on home page**
  - In `HomePageContent.tsx`, the breadcrumb items are computed from the current `tab`:
    - When `tab === "dashboard"`: show a single segment "Dashboard".
    - Otherwise: show "Dashboard" (link to `/`) and the current section label as the second segment (e.g. "Dashboard > Projects", "Dashboard > Database").

## Consequences

- The top bar breadcrumb now matches the active dashboard tab and is consistent with the document title and with other pages that use "Dashboard > …" breadcrumbs.
- Tab label changes need to be made only in `DASHBOARD_TAB_TITLES`; both title and breadcrumb stay in sync.
