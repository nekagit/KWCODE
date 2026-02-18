# ADR 0181: Command palette — Copy data directory path

## Status

Accepted.

## Context

The command palette (⌘K / Ctrl+K) already offered "Open data folder" to open the app data directory in the file manager, and the Database tab and Configuration page offered "Copy path" for the same directory. Users who prefer keyboard-driven workflows had no way to copy the data directory path without navigating to Configuration or the Database tab. Adding a "Copy data directory path" action to the command palette reuses the existing `copyAppDataFolderPath()` capability and completes quick access from the palette.

## Decision

- **CommandPalette.tsx**: Add an action "Copy data directory path" (Copy icon) that calls `copyAppDataFolderPath()` from `@/lib/copy-app-data-folder-path`, then closes the palette. Place it next to "Open data folder" for discoverability.
- **keyboard-shortcuts.ts**: Add one entry in the Command palette (⌘K) group: "Copy data directory path".
- No new Tauri commands or libs; reuse existing `copyAppDataFolderPath()` (which uses `get_data_dir` and `copyTextToClipboard`; in browser shows a toast that the feature is available in the desktop app).

## Consequences

- Users can copy the app data directory path from the command palette (⌘K → "Copy data directory path") without opening Configuration or the Database tab.
- Behavior matches the existing Database tab and Configuration "Copy path" (Tauri: path on clipboard; browser: toast that it is available in the desktop app).
- Single component touch and one shortcut doc entry; no new modules or store changes.
