# ADR 0243: Command palette — Open planner folder & Copy planner folder path

## Status

Accepted.

## Context

The app already offers "Open in file manager" and "Copy path" for Documentation, Technologies, and Ideas (.cursor folders) from the command palette. The planner (`.cursor/7. planner`) had no equivalent, so keyboard-first users could not open or copy its path from ⌘K.

## Decision

- Add two Tauri commands in `src-tauri/src/lib.rs`:
  - `open_planner_folder` — opens the app repo's `.cursor/7. planner` (or `.cursor` if the subfolder is missing) in the system file manager.
  - `get_planner_folder_path` — returns that path for clipboard copy.
- Add two frontend libs:
  - `src/lib/open-planner-folder.ts` — calls `open_planner_folder`; Tauri-only, toast in browser.
  - `src/lib/copy-planner-folder-path.ts` — calls `get_planner_folder_path` and copies to clipboard; Tauri-only, toast in browser.
- Add two command palette actions that call these libs and close the palette (same pattern as ideas/documentation/technologies).
- Document both actions in the Command palette group in `keyboard-shortcuts.ts`.

## Consequences

- Users can open the app repo's `.cursor/7. planner` folder in the file manager or copy its path from ⌘K without opening a project or the Planner tab.
- Behavior is consistent with other .cursor folder actions (Tauri-only in desktop app; info toast in browser).
- Backend and frontend follow the same patterns as documentation/ideas/technologies folder commands.
