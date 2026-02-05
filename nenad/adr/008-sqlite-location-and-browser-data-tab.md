# ADR 008: SQLite location and browser Data tab

## Status

Accepted.

## Context

- ADR 005 introduced SQLite at `data/app.db` with migration from JSON. The DB file is created at runtime and is gitignored, so it does not appear in the repo.
- ADR 006 added browser mode loading main data (projects, tickets, features, prompts) via `GET /api/data` from JSON. The **Data** tab (scripts, data/*.json list, kv_store) only loaded when running in Tauri (it used `list_scripts`, `list_data_files`, `get_kv_store_entries`). In the browser, users saw no scripts or JSON files in the app.

## Decision

- **SQLite location**: The database is at `data/app.db` (and WAL files `data/app.db-wal`, `data/app.db-shm`). It is **created** the first time the app runs in **Tauri**: `with_db()` opens the DB, runs schema init, then `migrate_from_json()` copies from `data/*.json` into the DB if the DB is empty. The file is in `.gitignore`; it is not committed.
- **Browser Data tab**: Add `GET /api/data/files` that returns `{ scripts, jsonFiles }` by reading `script/` and `data/*.json` from the project (Node `fs`, `process.cwd()`). Add `GET /api/data/file?path=...` to return file content for a path under project root (path sanitized, no `..`). When not in Tauri, the Data tab loads scripts and JSON file list from these APIs and can show file content via the file API. KV store in browser is derived from the same JSON (all_projects, cursor_projects) returned by `/api/data` or a small extension.
- **UI**: On the Data tab, show where data comes from: e.g. "SQLite: data/app.db (Tauri only, created on first run)" and "In browser, data is read from data/*.json via API."

## Consequences

- Users understand that the SQLite DB exists at `data/app.db` and is created on first Tauri run; no need to look for a committed DB file.
- In browser, the Data tab shows scripts and JSON files and allows viewing file content, consistent with Tauri behaviour where possible.
- Single place (ADR + UI hint) documents data source per environment.

## References

- ADR 005 (SQLite database for data)
- ADR 006 (Browser mode – load data from JSON via API)
