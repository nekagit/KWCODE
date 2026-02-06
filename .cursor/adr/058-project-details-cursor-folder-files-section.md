# ADR 058: Project details – .cursor folder files section

## Status

Accepted.

## Context

Users with a project that has a repo path set want to see which files exist in that project's `.cursor` folder (rules, ADRs, etc.) directly from the project details page.

## Decision

- **Tauri backend**
  - Add command `list_cursor_folder(project_path: String)` that:
    - Resolves `project_path/.cursor`; if it does not exist or is not a directory, returns an empty list.
    - Recursively lists all files under `.cursor` (not just top-level).
    - Returns `Vec<FileEntry>` (`name`, `path`) sorted by path; register in invoke handler.
- **Project details page**
  - Add a new accordion section at the bottom: **"Files in .cursor"**.
  - When the project has no `repoPath`: show copy that says to set a repo path (edit project) to load files.
  - When not running in Tauri (browser): show copy that listing is available in the desktop app.
  - When running in Tauri and `repoPath` is set: on mount/`repoPath` change, call `list_cursor_folder(project.repoPath)`; show loading state, then list of files (name + path) in a scrollable area, or an error message on failure.
  - Use `FolderOpen` icon and existing `ScrollArea`/card styling for consistency.

## Consequences

- Users can see all files under the project's `.cursor` directory from the project details page when using the desktop app and when a repo path is set.
- No new API route; listing uses Tauri filesystem access only. Web-only usage sees an explanatory message instead of a list.
