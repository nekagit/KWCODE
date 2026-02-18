# ADR 0242: Command palette — Download/Copy first project milestones as JSON and CSV

## Status

Accepted.

## Context

The project Milestones tab offers export and copy of the milestones list as JSON and CSV via existing libs (`download-project-milestones-json.ts`, `download-project-milestones-csv.ts`). The command palette had first-project actions for implementation log, designs, architectures, and tickets but no way to export the first active project's milestones from ⌘K, so keyboard-first users had to open the project and Milestones tab to use these actions.

## Decision

- Add four command palette actions:
  - **Download first project milestones as JSON** — resolves first active project, fetches milestones via `/api/data/projects/${projectId}/milestones`, then calls `downloadProjectMilestonesAsJson(milestones)`.
  - **Copy first project milestones as JSON** — same resolve/fetch, then `copyProjectMilestonesAsJsonToClipboard(milestones)`.
  - **Download first project milestones as CSV** — same resolve/fetch, then `downloadProjectMilestonesAsCsv(milestones)`.
  - **Copy first project milestones as CSV** — same resolve/fetch, then `copyProjectMilestonesAsCsvToClipboard(milestones)`.
- No new libs: reuse existing `download-project-milestones-json`, `download-project-milestones-csv` and fetch milestones the same way as `ProjectMilestonesTab` (API route).
- Resolver `resolveFirstProjectMilestones()` uses same guards as other first-project actions: require an active project, resolve by path via `listProjects()`, then fetch milestones. Toast on no project / load failure.
- Document all four actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can download or copy the first active project's milestones list as JSON or CSV from ⌘K without opening the project or Milestones tab.
- Parity with first-project tickets/designs/architectures and with the Milestones tab list export. Single source of truth in existing download/copy libs.
