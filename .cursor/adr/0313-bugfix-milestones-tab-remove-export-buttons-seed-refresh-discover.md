# ADR 0313 — Bugfix: Milestones tab remove export buttons; remove Seed template, Refresh, Discover folders

## Status

Accepted.

## Context

- On the **project details page**, **Milestones** tab showed Export JSON, Copy JSON, Export CSV, Copy CSV, Export Markdown, Copy Markdown, plus per-milestone "Download as Markdown" and "Copy as Markdown". Users requested removal of these.
- Projects list and related UI still exposed **Seed template project**, **Refresh**, and **Discover folders** (via `ProjectsHeader` and `NoProjectsFoundCard` when props were passed; and "Discover folders" link on the dashboard when no projects). Users requested removal of these controls.

## Decision

1. **Milestones tab (project details page)**
   - Remove from the milestones list toolbar: Export JSON, Copy JSON, Export CSV, Copy CSV, Export Markdown, Copy Markdown.
   - Remove from the selected milestone content area: "Download as Markdown" and "Copy as Markdown" buttons.
   - Keep: Open folder (Tauri), Convert to tickets, Edit, Delete, Add milestone. Milestone content is still displayed as markdown; only the export/copy actions were removed.

2. **Projects UI**
   - **ProjectsHeader**: Remove Refresh, Discover folders, and Seed template project buttons entirely. Header now only shows "New project". Optional props for those actions were removed; the component no longer accepts or renders them.
   - **NoProjectsFoundCard**: Remove Seed template project button; card now only shows "New project".
   - **SimpleDashboard**: Remove the "Discover folders" link from the empty state (when no projects). Keep "Create a project" link only.

## Implementation

- `ProjectMilestonesTab.tsx`: Removed imports and usage of `downloadProjectMilestonesAsJson`, `copyProjectMilestonesAsJsonToClipboard`, `downloadProjectMilestonesAsCsv`, `copyProjectMilestonesAsCsvToClipboard`, `downloadProjectMilestonesAsMarkdown`, `copyProjectMilestonesAsMarkdownToClipboard`, `downloadMilestoneContentAsMarkdown`, `copyMilestoneContentAsMarkdownToClipboard`, `safeNameForFile`. Removed the toolbar block of six export/copy buttons and the milestone-content Download/Copy Markdown toolbar; kept "Open folder" when Tauri.
- `ProjectsHeader.tsx`: Replaced optional `onRefresh`, `refreshing`, `onDiscoverFolders`, `seeding`, `seedTemplateProject` with a reserved `_` prop; removed Refresh, Discover folders, and Seed template project buttons.
- `NoProjectsFoundCard.tsx`: Replaced `seeding` and `seedTemplateProject` with reserved `_` prop; removed Seed template project button.
- `SimpleDashboard.tsx`: Removed "Discover folders" link and unused `FolderPlus` import from the no-projects empty state.

## Consequences

- Milestones tab is simpler: list, open folder, convert/edit/delete/add, and markdown content only.
- Projects list and dashboard no longer offer Seed template project, Refresh, or Discover folders in the UI. Command palette and API routes for those flows remain available for future use if needed.
