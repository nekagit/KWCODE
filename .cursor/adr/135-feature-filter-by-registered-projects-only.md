# ADR 135: Feature tab – filter dropdown shows only app-registered projects

## Status

Accepted.

## Context

ADR 050 introduced a "Filter by project" dropdown on the Feature tab. The implementation derived the dropdown options from `allProjects` (run-store), which in Tauri comes from `list_february_folders()` — i.e. all local repo directories under the February projects root. Users with one registered project (e.g. "kwcode") saw every local repo in the dropdown instead of only that project.

## Decision

- **Data source for filter dropdown**: The "Filter by project" dropdown options are now taken from **app-registered projects only** (from `listProjects()` / `GET /api/data/projects`), not from `allProjects` (local repos from `list_february_folders`).
- **When Feature tab is active**: HomePageContent fetches `listProjects()` and stores the result in `registeredProjects` state, then passes it to FeatureTabContent and FeatureManagementCard.
- **FeatureManagementCard**: Accepts optional `registeredProjects` (Project[]). When present, `projectsList` for the dropdown is built from registered projects (id = `repoPath ?? id`, name = project name). When absent, fallback remains `allProjects` for backward compatibility.
- **Add feature form**: Continues to use `allProjects` for project path selection (unchanged).

## Consequences

- The filter dropdown shows only projects the user has registered in the app (e.g. one entry "kwcode" instead of all local repos).
- Aligns with ADR 050’s intent: "each project name from the projects list" (registered projects list).
- Filter value is still a path (`repoPath`) so feature filtering by `project_paths` works as before.
