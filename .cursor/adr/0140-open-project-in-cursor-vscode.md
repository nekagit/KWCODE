# ADR 0140 — Open project in Cursor or VS Code

## Status

Accepted.

## Context

Users could open a project folder in the file manager or open a terminal at the project path from the project card (Projects list) and project header (Project detail), but had no way to open the project directly in Cursor or Visual Studio Code. Opening in an editor required opening a terminal or the folder first and then launching the editor manually.

## Decision

- Add **Open in Cursor** and **Open in VS Code** from the project card and project header.
- **Backend:** New Tauri command `open_project_in_editor(project_path: String, editor: String)` where `editor` is `"cursor"` or `"vscode"`. On macOS use `open -a "Cursor" path` / `open -a "Visual Studio Code" path`; on Windows and Linux spawn the editor CLI (`cursor` or `code`) with the project path (assumes the editor is installed and in PATH). Validate that the path exists and is a directory; return clear errors if the editor fails to launch.
- **Frontend:** New lib `src/lib/open-project-in-editor.ts` with `openProjectInEditor(repoPath, editor)` that invokes the command and shows success/error toasts; in browser mode show a toast that the feature is available in the desktop app.
- **ProjectCard:** Add icon buttons (Code2 and Code from Lucide) for "Open in Cursor" and "Open in VS Code" next to existing Open folder, Terminal, and Copy path.
- **ProjectHeader:** Add "Open in Cursor" and "Open in VS Code" buttons after "Open in Terminal".

## Consequences

- Users can open a project in Cursor or VS Code with one click from the Projects list or Project detail page, without using the terminal or file manager.
- Aligns with existing "Open folder" and "Open in Terminal" actions. On non-macOS, the editor must be installed and its CLI in PATH for the command to succeed.
