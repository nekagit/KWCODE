# ADR 0193 — Command palette: Open first project in file manager

## Status

Accepted.

## Context

The Command palette (⌘K) offers "Open first project in Cursor" and "Open first project in Terminal" (ADR 0147), but there was no way to open the first active project's folder in the system file manager (Finder / Explorer) from the palette. The project header and project card already offer "Open folder" via `openProjectFolderInFileManager(repoPath)`. Keyboard-first users had to navigate to a project to open its folder.

## Decision

- Add a Command palette action **"Open first project in file manager"** that:
  - Resolves the first active project (same pattern as "Open first project in Cursor" / "Open first project in Terminal"): `activeProjects[0]`, then find project in `projects ?? listProjects()`.
  - Calls `openProjectFolderInFileManager(proj.repoPath)` from `@/lib/open-project-folder`.
  - If no active project: toast "Select a project first", navigate to `/projects`, close palette.
  - If project not found: toast "Open a project first", close palette.
- Use **Folder** icon (Lucide) to distinguish from FolderOpen used for "Go to first project" and "Open documentation folder".
- Place the entry after "Open first project in Terminal" in the action list.
- No new Tauri commands or API routes; reuse existing `openProjectFolderInFileManager`.

## Consequences

- Users can open the first active project's folder in the system file manager from the Command palette (⌘K) without opening the Projects list or project detail page.
- Completes the trio: Open first project in Cursor, Open first project in Terminal, Open first project in file manager.
- Run `npm run verify` to confirm tests, build, and lint pass.
