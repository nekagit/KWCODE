# ADR 0239: Command palette — Download/Copy first project tickets (JSON, CSV, Markdown)

## Status

Accepted.

## Context

The project Tickets tab offers export/copy as JSON, CSV, and Markdown via existing libs (`download-project-tickets-json`, `download-project-tickets-csv`, `download-project-tickets-md`). The command palette had first-project actions for implementation log, designs, and architectures but no way to export the first active project's tickets from ⌘K. Keyboard-first users had to open the project and the Tickets tab to download or copy.

## Decision

- Add six command palette actions:
  - **Download first project tickets as JSON** / **Copy first project tickets as JSON**
  - **Download first project tickets as CSV** / **Copy first project tickets as CSV**
  - **Download first project tickets as Markdown** / **Copy first project tickets as Markdown**
- Reuse existing libs: `fetchProjectTicketsAndKanban(projectId)` from `@/lib/fetch-project-tickets-and-kanban`; download/copy from `download-project-tickets-json`, `download-project-tickets-csv`, `download-project-tickets-md`.
- Add a shared `resolveFirstProjectTickets` helper: require at least one active project, resolve project by path via `listProjects()`, then `fetchProjectTicketsAndKanban(proj.id)`; return `{ projectName: proj.name, tickets }`; handlers call the existing download/copy functions (Markdown uses `projectName` for the header).
- Document all six actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can download or copy the first active project's tickets as JSON, CSV, or Markdown from ⌘K without opening the project or the Tickets tab.
- Behavior and format match the project Tickets tab exports; single source of truth in existing libs.
