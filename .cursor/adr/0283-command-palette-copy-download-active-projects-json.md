# ADR 0283 — Command palette: Copy/Download active projects as JSON

## Status

Accepted.

## Context

- The app exports the **full projects list** as JSON/CSV (command palette and Projects page) and supports "Copy first project path".
- There was no way to export the **currently selected (active) projects** — the subset of paths the user has selected for Run/Worker context — as a single JSON document.
- Users may want to share or script the current selection (e.g. for docs, automation, or reporting).

## Decision

- Add **Copy active projects as JSON** and **Download active projects as JSON** to the command palette.
- New lib `src/lib/active-projects-export.ts`: build payload `{ exportedAt, count, paths, projects? }` (paths plus optional path+name when project list is available), `copyActiveProjectsAsJsonToClipboard(paths, projects?)`, `downloadActiveProjectsAsJson(paths, projects?)`. Reuse existing clipboard and download helpers.
- Command palette: two new actions that read `activeProjects` from the store and project list via `listProjects()`, then call the lib. Empty selection shows an info toast and returns.
- Keyboard shortcuts help: add the two actions under the Command palette group.

## Consequences

- Users can copy or download the current active-project set as JSON from ⌘K, with optional name enrichment when project list is loaded.
- Aligns with existing "Copy/Download projects list" and first-project copy patterns; minimal touch to CommandPalette and keyboard-shortcuts only.
