# ADR 0245: Command palette — Open milestones folder & Copy milestones folder path

## Status

Accepted.

## Context

The app already offers "Open in file manager" and "Copy path" from the command palette (⌘K) for Documentation, Technologies, Ideas, and Planner (`.cursor` subfolders). The milestones folder (`.cursor/milestones`, where `*.milestone.md` files live) had no such actions. Keyboard-first users had no parity for opening or copying the milestones folder path without navigating the file system manually.

## Decision

- **Backend:** Add two Tauri commands in `src-tauri/src/lib.rs`:
  - `open_milestones_folder` — opens the app repo's `.cursor/milestones` directory in the system file manager (fallback: `.cursor` if `milestones` is missing).
  - `get_milestones_folder_path` — returns that path for copy-to-clipboard (same fallback).
- **Frontend libs:** Add `src/lib/open-milestones-folder.ts` and `src/lib/copy-milestones-folder-path.ts` that invoke these commands; Tauri-only, toast in browser.
- **Command palette:** Add two actions: "Open milestones folder in file manager" and "Copy milestones folder path" (after planner folder actions).
- **Keyboard shortcuts help:** Add the two entries to the Command palette group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can open the milestones folder or copy its path from ⌘K, matching the pattern used for documentation, technologies, ideas, and planner.
- No new UI surfaces; only command palette and shortcuts help updated.
