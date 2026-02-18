# ADR 0312 — Projects index page: remove export, refresh, discover, seed

## Status

Accepted.

## Context

- The Projects list page (project index at `/projects`) showed Print, Export (JSON, Copy JSON, CSV, Copy CSV, MD, Copy MD), Refresh, Discover folders, and Seed template project.
- These controls added clutter; users requested a simpler project index.

## Decision

- **Remove** from the project index page (`ProjectsListPageContent`, `/projects`):
  - **Print** button.
  - **Export** block: Print JSON, Copy JSON, CSV, Copy CSV, MD, Copy MD (download and copy for JSON, CSV, Markdown).
  - **Refresh** button (and its handler/state).
  - **Discover folders** button and the Discover folders dialog (and `?discover=1` navigation handling).
  - **Seed template project** button (in header and in empty state).
- **Implementation**:
  - `ProjectsListPageContent.tsx`: Removed Print and all Export buttons; stopped passing `onRefresh`, `refreshing`, `onDiscoverFolders`, `seeding`, `seedTemplateProject` to `ProjectsHeader`; removed `DiscoverFoldersDialog` and related state/effect; removed `handleRefresh`, `seedTemplateProject`, and unused state; `NoProjectsFoundCard` used without seed props.
  - `ProjectsHeader.tsx`: Made `seeding` and `seedTemplateProject` optional; Seed template project button is rendered only when `seedTemplateProject` is provided. Refresh and Discover folders remain optional and only shown when their props are passed (other callers can still use them if needed).
  - `NoProjectsFoundCard.tsx`: Made `seeding` and `seedTemplateProject` optional; Seed template project button is rendered only when `seedTemplateProject` is provided.
- Filter, sort, Reset filters, and "New project" remain. Internal `refetch` is still used after delete.

## Consequences

- Projects index is simpler: filter, sort, project cards, and "New project" only.
- Export/refresh/discover/seed can be re-added later by passing the optional props or restoring the buttons in the list page.
- Command palette and other pages that use "Discover folders" or "Refresh data" are unchanged.
