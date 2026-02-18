# ADR 0288 — Command palette: Copy/Download active projects as CSV

## Status

Accepted.

## Context

- The app already exports the current **active projects** (selected for Run/Worker) as JSON via the command palette (ADR 0283): "Copy active projects as JSON" and "Download active projects as JSON".
- There was no CSV export for the same data. Users may want a spreadsheet-friendly format (e.g. path and name per row) for reporting or scripting, consistent with other CSV exports (dashboard metrics, run history stats, first-project tickets/milestones).

## Decision

- Add **Copy active projects as CSV** and **Download active projects as CSV** to the command palette.
- Extend `src/lib/active-projects-export.ts`: add `buildActiveProjectsCsv(payload)` (header `path,name`; one row per project using optional path+name when project list is available), `copyActiveProjectsAsCsvToClipboard(paths, projects?)`, `downloadActiveProjectsAsCsv(paths, projects?)`. Reuse `escapeCsvField` from `@/lib/csv-helpers`, `filenameTimestamp`, `triggerFileDownload`, `copyTextToClipboard`; empty selection shows info toast.
- Command palette: two new actions that read `activeProjects` and project list via `listProjects()`, then call the lib. Keyboard shortcuts help: add the two actions under the Command palette group.

## Consequences

- Users can copy or download the current active-project set as CSV from ⌘K, with path and optional name columns, aligned with existing JSON export and other CSV exports in the app.
