# ADR 0138 — Database tab: Open data folder and Copy path

## Status

Accepted.

## Context

The Home page "Database" (All data) tab shows scripts, JSON files, and DB data (kv_store, tickets) and describes "SQLite: data/app.db" and the data directory, but had no action to open that directory or copy its path. Users had to go to Configuration to use "Open data folder". Documentation, Ideas, Technologies, and Configuration already offer "Open folder" and/or "Copy path" for their relevant locations.

## Decision

- Add **Open data folder** and **Copy path** to the Database tab (DatabaseDataTabContent).
- **New lib** `src/lib/copy-app-data-folder-path.ts`: `copyAppDataFolderPath()` invokes `get_data_dir`, copies the path to the clipboard via `copyTextToClipboard`; in browser shows a toast that the feature is available in the desktop app. Same pattern as `copy-documentation-folder-path.ts`.
- **DatabaseDataTabContent**: Add a toolbar row with "Open data folder" (FolderOpen icon, `openAppDataFolderInFileManager` from `@/lib/open-app-data-folder`) and "Copy path" (Copy icon, `copyAppDataFolderPath`). Reuse existing open-app-data-folder lib; no new Tauri commands.

## Consequences

- Users can open the app data directory or copy its path directly from the Database tab on Home, without navigating to Configuration.
- Aligns the Database tab with Documentation, Ideas, Technologies, and Configuration for quick access to folder/path actions.
