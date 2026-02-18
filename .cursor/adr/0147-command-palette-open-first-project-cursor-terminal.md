# ADR 0147 — Command palette: Open first project in Cursor and Open first project in Terminal

## Status

Accepted.

## Context

The Command palette (⌘K) offers "Go to Run", which navigates to the Run tab for the first active project, but there was no way to open that project directly in Cursor or in the system terminal from the palette. Users had to go to the Projects list or a project detail page to use "Open in Cursor" or "Open in Terminal". Power users who already have a primary (first) active project would benefit from launching the editor or terminal from anywhere.

## Decision

- Add two Command palette actions:
  - **Open first project in Cursor** — Uses `openProjectInEditor(activeProjects[0], "cursor")`. If no active project, show toast "Select a project first", navigate to `/projects`, and close the palette.
  - **Open first project in Terminal** — Uses `openProjectInSystemTerminal(activeProjects[0])`. Same no-active-project behavior.
- Reuse existing libs: `openProjectInEditor` from `@/lib/open-project-in-editor`, `openProjectInSystemTerminal` from `@/lib/open-project-in-terminal`. No new Tauri commands or API routes.
- Icons: Code2 (Cursor), Terminal (Lucide). Place both entries after "Go to Run" in the action list.

## Consequences

- Users can open the first active project in Cursor or in the system terminal from the Command palette (⌘K) without opening the Projects list or project detail page.
- Behavior aligns with "Go to Run" when no project is selected (toast + redirect to /projects).
- Run `npm run verify` to confirm tests, build, and lint pass.
