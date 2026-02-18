# ADR 0199 — Command palette: Open first project's .cursor folder in file manager

## Status

Accepted.

## Context

The Command palette (⌘K) has "Open first project in file manager" (ADR 0193), which opens the project repo root. The project header offers "Open .cursor folder" via `openProjectCursorFolderInFileManager(repoPath)` from `@/lib/open-project-cursor-folder`, opening the project's `.cursor` directory in the system file manager. Keyboard-first users had no way to open the first active project's `.cursor` folder from the palette without navigating to the project detail page.

## Decision

- Add a Command palette action **"Open first project's .cursor folder"** that:
  - Resolves the first active project (same pattern as "Open first project in file manager"): `activeProjects[0]`, then find project in `projects ?? listProjects()`.
  - Calls `openProjectCursorFolderInFileManager(proj.repoPath)` from `@/lib/open-project-cursor-folder`.
  - If no active project: toast "Select a project first", navigate to `/projects`, close palette.
  - If project not found: toast "Open a project first", close palette.
- Use **FolderCog** icon (Lucide) to distinguish from Folder (repo root) and to suggest config/cursor folder.
- Place the entry after "Open first project in file manager" in the action list.
- No new Tauri commands or API routes; reuse existing `openProjectCursorFolderInFileManager`.

## Consequences

- Users can open the first active project's `.cursor` folder in the system file manager from the Command palette (⌘K) without opening the project detail page.
- Complements the existing "Open first project in file manager" (repo root) and aligns with the project header "Open .cursor folder" action.
- Run `npm run verify` to confirm tests, build, and lint pass.
