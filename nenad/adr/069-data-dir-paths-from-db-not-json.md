# ADR 069: Data dir and paths from DB, not hardcoded JSON

## Status

Accepted.

## Context

- App data (projects, tickets, features, prompts, ideas, designs, architectures) was read/written from hardcoded paths under `data/` (e.g. `data/projects.json`, `data/ideas.json`). Tauri used `project_root()` + `data_dir(&ws)` and Next.js API used `findDataDir()` (cwd + `"data"`).
- Relying on fixed paths and JSON filenames makes it hard to change where data lives and to support multiple or configurable data locations.

## Decision

- **Store the data directory path in the database** (SQLite `kv_store` key `data_dir`). On first run or migration, persist the resolved data dir (from project root) so all subsequent access uses the path from the DB.
- **Tauri**: Add `get_data_dir(conn, fallback)` and `set_data_dir(conn, path)` in `db.rs`. After `migrate_from_json`, write the data dir into `kv_store`. Introduce `resolve_data_dir()` that uses `with_db` to read (or default and write) the data dir. All Tauri commands that read/write `data/*.json` use `resolve_data_dir()` instead of `data_dir(project_root()?)`.
- **DB as source of paths**: File access for projects, prompts, ideas, designs, architectures, list_data_files, get_prompts, save_active_projects, save_features, run_script (cursor_projects path) uses the path from the DB. `project_root()` remains for script path and workspace root only.
- **Browser / Next.js**: Unchanged: no DB in browser; Next.js API continues to use `findDataDir()` for dev. Tauri is the primary runtime where paths come from the DB.
- **Expose** a Tauri command `get_data_dir` returning the path string so the UI can show where data is stored.

## Consequences

- Single source of truth for “where is data” in Tauri: the DB. No hardcoded `data/` in the backend for file access.
- Future: data dir can be made configurable (e.g. settings screen) by updating `kv_store` and using it everywhere.
- Browser mode still uses Next.js `findDataDir()`; no behavioral change there.

## References

- ADR 005 (SQLite), ADR 008 (SQLite location, browser Data tab).
