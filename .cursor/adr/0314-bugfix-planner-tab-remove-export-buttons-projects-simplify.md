# ADR 0314 — Bugfix: Planner tab remove export buttons; Projects remove seed, refresh, discover

## Status

Accepted.

## Context

- On the **project details page**, in the **Planner** tab, the UI showed export actions: Print JSON, Copy JSON, CSV (download/copy), MD (download/copy). These were requested to be removed.
- On the **Projects** area (list and dashboard), **Seed template project**, **Refresh**, and **Discover folders** were to be removed for a simpler UX.

## Decision

1. **Planner tab (project details)**
   - **Remove** the entire "Export tickets" block from `ProjectTicketsTab.tsx`: Download as JSON, Copy as JSON, Download as CSV, Copy as CSV, Download as Markdown, Copy as Markdown.
   - Remove unused imports: `Copy`, `Download`, `FileJson`, `FileText` from lucide-react; and the download/copy helpers from `download-project-tickets-md`, `download-project-tickets-csv`, `download-project-tickets-json`.

2. **Projects header**
   - **Remove** from `ProjectsHeader.tsx`: Refresh button, Discover folders button, Seed template project button, and their props (`onRefresh`, `refreshing`, `onDiscoverFolders`, `seeding`, `seedTemplateProject`). The header now only shows "New project".

3. **No projects empty state**
   - **Remove** from `NoProjectsFoundCard.tsx`: Seed template project button and its props (`seeding`, `seedTemplateProject`). The card now only shows "New project".

4. **Dashboard (SimpleDashboard)**
   - **Remove** the "Discover folders" link from the empty state when there are no projects (only "Create a project" remains).

## Consequences

- Planner tab is simpler: stats and Kanban only, no export toolbar.
- Projects list and empty states no longer offer Seed template project, Refresh, or Discover folders from the UI; "New project" remains.
- Command palette and other entry points that reference "Discover folders" or "Refresh data" are unchanged.
- Export of tickets (JSON/CSV/MD) can be re-added later in the Planner tab or via command palette if needed.
