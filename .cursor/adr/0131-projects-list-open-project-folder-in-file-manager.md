# ADR 0131 — Projects list: Open project folder in file manager from card

## Status

Accepted.

## Context

The Projects list page shows each project as a card with name, description, repo path, Copy path button, and meta. The project detail header already has "Open folder" and "Open .cursor folder" that open the repo (or .cursor) in the system file manager. On the list, users had to open a project first to use "Open folder"; there was no way to open the project directory directly from the card. Other app pages (Documentation, Ideas, Technologies, Configuration) already offer "Open folder" for their respective locations.

## Decision

- In **ProjectCard**, when `project.repoPath` is set, add an **Open folder** icon button (FolderOpen from Lucide) next to the existing Copy path button in the path row. On click: stop event propagation (so the card does not open), call `openProjectFolderInFileManager(project.repoPath)` from `@/lib/open-project-folder`. Reuse existing Tauri command `open_path_in_file_manager`; no new lib module.
- Button: ghost, small (same as Copy), aria-label "Open project folder in file manager", title "Open folder". In browser mode the lib shows a toast that the feature is available in the desktop app.

## Consequences

- Users can open a project's directory in the system file manager from the Projects list without opening the project detail, matching the behaviour of the project detail header and aligning with other "Open folder" actions in the app.
- Minimal change: one component touch, one new ADR; follows existing open-folder patterns (open-project-folder, open-documentation-folder, etc.).
