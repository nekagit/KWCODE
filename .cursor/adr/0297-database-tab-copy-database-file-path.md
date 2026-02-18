# ADR 0297 — Database tab: Copy database file path

## Status

Accepted.

## Context

- The Dashboard Database tab (DB Data card) shows "Open data folder" and "Copy path" (app data directory). The command palette already has "Copy database file path" (ADR 0285), which copies the full path to `app.db`.
- Users on the Database tab had no in-page way to copy the database file path; they had to open the command palette (⌘K) and search for the action.

## Decision

- Add a **Copy database file path** button to the Database tab toolbar (DatabaseDataTabContent):
  - Reuse existing `copyDatabaseFilePath()` from `src/lib/copy-database-file-path.ts` (Tauri-only; shows toast in browser).
  - Place the button next to "Copy path" in the same row; show only when `isTauriEnv === true`.
  - Same styling as "Copy path" (outline, sm, Copy icon). Label: "Copy database file path"; title: "Copy path to app.db".

## Consequences

- Users can copy the full path to app.db directly from the Database tab for backup, external SQLite viewers, or support.
- Aligns with existing command-palette action and with "Open data folder" / "Copy path" on the same card.
- No new lib or Tauri command; minimal touch to DatabaseDataTabContent only.
