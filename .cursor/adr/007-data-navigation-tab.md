# ADR 007: Data navigation tab

## Status

Accepted.

## Context

Users need a single place to inspect all app-related data: scripts in `script/`, JSON files in `data/`, and the SQLite database (kv_store, tickets, features, projects). This supports debugging, backups, and transparency.

## Decision

- **New sidebar tab "Data"** (icon: Database) between AI Generate and Log.
- **Backend (Tauri)**:
  - `list_scripts()` – list files in `script/` (name, path).
  - `list_data_files()` – list `*.json` files in `data/` (name, path).
  - `read_file_text(path)` – read a file as UTF-8 text; path must be under project root (security).
  - `get_kv_store_entries()` – return all rows from `kv_store` (key, value) for the Data view.
- **Frontend (Data tab)**:
  - **Scripts**: list from `script/`; click to show file content in a preview panel.
  - **JSON files**: list from `data/*.json`; click to show file content.
  - **Database**: show kv_store entries, tickets, features, all_projects, cursor_projects (using existing loaded state and `get_kv_store_entries`).
- Data (scripts, JSON list, kv entries) is loaded when the Data tab is selected (effect only in Tauri).

## Consequences

- One place to view scripts, JSONs, and DB content without leaving the app.
- Read-only view; no edit/delete from this tab.
- ADR recorded in `.cursor/adr` and `nenad/adr` per project rules.

## References

- ADR 005 (SQLite database) for DB layout.
- Best practice: expose data visibility for AI/automation projects.
