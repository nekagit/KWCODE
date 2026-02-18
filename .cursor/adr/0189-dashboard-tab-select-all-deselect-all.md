# ADR 0189: Dashboard tab — Select all / Deselect all for displayed projects

## Status

Accepted.

## Context

The Home page "Projects" tab and "All data" tab already offer "Select all" and "Deselect all" for active run projects (ADR 0146). The Dashboard tab (first home tab) shows recent project cards but had no bulk way to set active projects. Users had to switch to the Projects or All data tab to select or clear all projects for run.

## Decision

- **DashboardOverview**: Add optional `setActiveProjects` prop. When provided and there are displayed projects (`projectsForDisplay.length > 0`), show "Select all" and "Deselect all" buttons in the Projects section header (same icons as ProjectsTabContent: CheckSquare, Square).
  - **Select all**: Call `setActiveProjects(projectsForDisplay.map(p => p.repoPath ?? p.id))`, then toast: "X project(s) selected for run. Save on the Projects tab to persist."
  - **Deselect all**: Call `setActiveProjects([])`, then toast: "No projects selected for run."
- **DashboardTabContent**: Get `setActiveProjects` from `useRunState()` and pass it to `DashboardOverview`, so the Dashboard tab has the same bulk actions as the Projects and All data tabs.
- Persistence is unchanged: the user must open the Projects tab and click "Save active to cursor_projects.json" to persist; the Dashboard buttons only update in-memory active projects.

## Consequences

- Users can select or deselect all displayed projects for run directly from the Dashboard tab, without switching tabs.
- Behaviour is consistent with ADR 0146 (Projects and All data tabs); same wording and icons.
- Optional prop keeps `DashboardOverview` reusable in contexts that do not provide `setActiveProjects` (e.g. embed without run store).
- Single touch to DashboardOverview and DashboardTabContent; no new Tauri commands or API routes.
