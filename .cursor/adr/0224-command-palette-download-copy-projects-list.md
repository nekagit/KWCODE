# ADR 0224: Command palette — Download projects list and Copy projects list (JSON and CSV)

## Status

Accepted.

## Context

The Projects page offers download and copy for the projects list (JSON and CSV). Keyboard-first users had no way to export or copy the projects list from the command palette (⌘K) without opening the Projects page. Other export surfaces (ideas, tech stack, prompts, documentation info, run history) already expose download/copy actions from the palette.

## Decision

- Add four command palette actions: **Download projects list as JSON**, **Copy projects list as JSON**, **Download projects list as CSV**, **Copy projects list as CSV**.
- Reuse existing `listProjects()` from `@/lib/api-projects` (dual-mode) to load the current projects list when the user triggers an action. Palette handlers call `listProjects()`, then the existing export libs (`download-projects-list-json`, `download-projects-list-csv`) for format and toasts. No new fetch lib is required.
- Document the four actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can export or copy the projects list from ⌘K without navigating to the Projects page.
- Behavior and file formats match the Projects page (e.g. `projects-list-{timestamp}.json`, same CSV columns and JSON payload).
- Same empty-list and error handling as the page (toast "No projects to export" or "Failed to load projects").
