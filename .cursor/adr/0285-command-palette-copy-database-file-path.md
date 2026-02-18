# ADR 0285 — Command palette: Copy database file path

## Status

Accepted.

## Context

- The app has "Copy data directory path" (folder where app.db and other data live) and "Open data folder" in the command palette.
- There was no way to copy the **exact path to the SQLite database file** (e.g. `…/data/app.db`). Users needing the DB path for backup scripts, external SQLite viewers, or support had to append `/app.db` manually.

## Decision

- Add **Copy database file path** to the command palette:
  - New lib `src/lib/copy-database-file-path.ts`: invoke `get_data_dir`, build path as `{dataDir}/app.db` (handling trailing slash), copy via `copyTextToClipboard`; Tauri-only (toast in browser).
  - Command palette: one new action "Copy database file path" (Copy icon), placed after "Copy data directory path".
  - `src/data/keyboard-shortcuts.ts`: add one entry for the new action (⌘K / Ctrl+K).
- No new Tauri command; reuse existing `get_data_dir`.

## Consequences

- Users can copy the full path to app.db from the command palette for backup, external tools, or support.
- Aligns with existing "Copy data directory path" and "Open data folder" patterns.
- Single new lib and minimal touches to CommandPalette and keyboard-shortcuts.
