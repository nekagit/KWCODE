# ADR 0311 — Dashboard simplified to KPI cards, quick actions, and project list

## Status

Accepted.

## Context

- The Dashboard previously showed an "Overview" hero with inline stats, a large export toolbar (Print, Copy/Download as JSON, CSV, Markdown), entity quick links, Run history stats card, and a project list.
- Copy/export and overview complexity added maintenance and UI clutter; users requested a simpler dashboard.

## Decision

- **Remove** from the Dashboard:
  - The "Overview" hero strip and its copy/export toolbar (Print, Copy as JSON, Download as JSON, Copy as CSV, Download as CSV, Copy as Markdown, Download as Markdown).
  - All dashboard metrics copy/export entries from the command palette and from the keyboard shortcuts list.
- **Replace** the dashboard content with a **simple dashboard** that includes only:
  1. **KPI cards** — Four cards: Projects, Tickets, Prompts, Designs (data from `get_dashboard_metrics`).
  2. **Quick actions** — Links to Projects, Run, Prompts, Ideas, Design, Architecture, Testing, Planner, Versioning, Technologies, Documentation, Configuration, Loading, plus Testing and Shortcuts buttons.
  3. **Project list** — Filterable list of projects (recent-first, up to 12), with Select all / Deselect all for run context, and "View all" to `/projects`. Empty state: Create a project / Discover folders.
- **Implementation**:
  - New component: `SimpleDashboard.tsx` in `src/components/molecules/DashboardsAndViews/`.
  - `DashboardTabContent` uses `SimpleDashboard` instead of the previous `DashboardOverview`.
  - `DashboardOverview.tsx` is kept as a re-export of `SimpleDashboard` for backward compatibility; the old implementation code was removed.
  - Command palette: removed the six dashboard metrics copy/download actions (JSON, CSV, Markdown).
  - `src/data/keyboard-shortcuts.ts`: removed the six dashboard metrics shortcut descriptions.
  - Dashboard export libs (`copy-dashboard-metrics`, `download-dashboard-metrics-json`, `download-dashboard-metrics-csv`, `download-dashboard-metrics-md`) are left in place; they are now unused by the UI but can be reused later if needed.
- Run history stats card is **not** included in the simple dashboard to keep the page minimal.

## Consequences

- Dashboard is easier to scan and maintain.
- No inline export actions on the dashboard; other export flows (e.g. app info, run history, projects list) remain in the command palette.
- ADRs 0272, 0283, 0284, 0290, 0300 and related dashboard export/print decisions are superseded for the Dashboard tab; command-palette export of other data is unchanged.
