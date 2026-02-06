# ADR 070: Project details – Files in .cursor as macOS-style list view

## Status

Accepted.

## Context

The "Files in .cursor" section (ADR 058) showed a flat list of all files. Users wanted a filesystem-like view similar to macOS Finder list view: folders shown with folder icons, contents hidden until the folder is opened (expand/collapse).

## Decision

- **Tree from flat list**
  - Keep using `list_cursor_folder(projectPath)` (unchanged); it still returns a flat list of `{ name, path }` (full filesystem paths).
  - On the frontend, build a tree from the flat list by:
    - Normalizing paths (forward slashes) and deriving paths relative to `project.repoPath`.
    - Parsing relative paths (e.g. `.cursor/adr/001-foo.md`) into a single root node `.cursor` with nested folder and file nodes.
  - Folders are sorted before files at each level; siblings sorted alphabetically by name.
- **List view UI**
  - One root row: **.cursor** (folder). Only this level is expanded by default.
  - Each folder row: chevron (right when collapsed, down when expanded), folder icon (closed/opened by state), folder name. Click toggles expand/collapse; children are not shown until expanded.
  - Each file row: file icon, name, "Add" button (add to project spec) shown on hover; same behavior as before.
  - Indentation by depth (e.g. 16px per level) so hierarchy is clear.
- **Implementation**
  - New component `CursorFilesTree` in `src/components/cursor-files-tree.tsx`: builds tree from `cursorFiles` + `repoPath`, owns expanded state (`Set<string>` of folder paths), renders recursive list.
  - Project details page "Files in .cursor" accordion content uses `CursorFilesTree` instead of the previous flat `<ul>` list; ScrollArea height increased slightly (280px) for tree depth.

## Consequences

- Users see a compact, Finder-like list: folders can be collapsed so only the structure is visible until they open a folder.
- No backend changes; tree is built client-side from the existing flat file list.
- "Add to project spec" remains per file, with the same behavior and disabled state when already in spec.
