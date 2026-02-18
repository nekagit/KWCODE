# ADR 0286 — Command palette: Copy database file path

## Status

Accepted.

## Context

The app exposes "Copy data directory path" (folder where `app.db` and other data live) and "Open data folder". There was no way to copy the **exact path to the SQLite database file** (e.g. `…/data/app.db`). Support, backup scripts, and opening the DB in an external SQLite viewer (e.g. DB Browser for SQLite) benefit from having the full file path.

## Decision

- Add a **Copy database file path** action to the command palette.
- **New lib** `src/lib/copy-database-file-path.ts`: invoke `get_data_dir`, build path as `{dataDir}/app.db`, copy to clipboard via `copyTextToClipboard`; Tauri-only (toast in browser). Reuse pattern from `copy-app-data-folder-path.ts`.
- **Command palette:** One new action "Copy database file path" (Copy icon), placed after "Copy data directory path".
- **keyboard-shortcuts.ts:** One new entry in the Command palette group.

## Consequences

- Users can copy the full path to `app.db` from the command palette for external tools or scripts.
- No new Tauri command; reuses existing `get_data_dir`.
- Single new lib and minimal touches to CommandPalette and keyboard-shortcuts.
