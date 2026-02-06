# ADR 050: Feature tab – filter features by project

## Status

Accepted.

## Context

The Feature tab (Dashboard → Feature) lists all features. Projects (from `data/projects.json`) link to features via `featureIds`. Users need to see only the features that belong to a given project without leaving the Feature tab.

## Decision

- **Filter by project**: On the Feature tab, add a "Filter by project" dropdown (Select) above the feature list. Options: "All projects" and each project name from the projects list.
- **Data**: When the Feature tab is active, fetch the projects list via `listProjects()` (from `@/lib/api-projects`), which uses Tauri invoke or `GET /api/data/projects`. Store in local state (`projectsList`, `featureProjectFilter`).
- **Filtering**: When a project is selected, show only features whose `id` is in that project's `featureIds`. Use `useMemo` to derive `filteredFeatures` from `features`, `featureProjectFilter`, and `projectsList`.
- **Title and empty state**: Show count as "Feature (n)" when no filter, or "Feature (n of total)" when filtered. When filtered and no features match, show empty state: "No features in this project" with hint to select another project or add features from the project edit page.

## Consequences

- Users can quickly narrow the feature list to a single project.
- Projects list is loaded only when the Feature tab is shown.
- Filter state is local (not persisted in URL) so switching tabs resets context as expected.
