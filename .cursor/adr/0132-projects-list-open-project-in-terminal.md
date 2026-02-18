# ADR 0132 — Projects list: Open project in system terminal from card

## Status

Accepted.

## Context

The Projects list page shows each project as a card with path, "Open folder", and "Copy path". The project detail header already has "Open in terminal" that opens the system terminal (e.g. Terminal.app) with the project path as the current working directory. On the list, users had to open a project first to use "Open in terminal"; there was no way to open the project in the terminal directly from the card.

## Decision

- In **ProjectCard**, when `project.repoPath` is set, add an **Open in terminal** icon button (Terminal from Lucide) next to the existing Open folder and Copy path buttons in the path row. On click: stop event propagation (so the card does not open), call `openProjectInSystemTerminal(project.repoPath)` from `@/lib/open-project-in-terminal`. Reuse existing Tauri command `open_project_in_system_terminal`; no new lib module.
- Button: ghost, small (same as Open folder and Copy path), aria-label "Open project in system terminal", title "Open in terminal". In browser mode the lib shows a toast that the feature is available in the desktop app.

## Consequences

- Users can open a project in the system terminal from the Projects list without opening the project detail, matching the behaviour of the project detail header.
- Minimal change: one component touch, one new ADR; follows existing open-project-in-terminal pattern used in ProjectHeader.
