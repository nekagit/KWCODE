# ADR 005: SQLite database for app data

## Status

Accepted.

## Context

App data (all projects, active projects, tickets, features) was stored only in JSON files under `data/`. A single SQL store improves querying, integrity, and allows future migrations and tooling.

## Decision

- **Introduce SQLite** as the primary store for app data in the Tauri backend.
- **Database file**: `data/app.db` (next to existing JSON in the workspace data dir). WAL mode enabled.
- **Tables**: `kv_store` (key-value for all_projects, cursor_projects), `tickets`, `features`. Array/JSON fields stored as TEXT.
- **One-time migration**: On first run, if the DB is empty, data is migrated from existing `all_projects.json`, `cursor_projects.json`, `tickets.json`, and `features.json`. JSON files are not deleted so they can serve as backup or be removed later.
- **Script compatibility**: `run_prompts_all_projects.sh` still reads `cursor_projects.json` and `prompts-export.json`. On save of active projects we write both to the DB and to `cursor_projects.json`. Prompts remain JSON-only (read from `prompts-export.json`).
- **Rust**: New `db` module (`src-tauri/src/db.rs`), `rusqlite` with bundled feature. All get/save commands go through `with_db()` which opens DB, runs migration if needed, then runs the query.

## Consequences

- Single source of truth for tickets and features; projects (all/active) in DB with JSON export for the script.
- Existing JSON is migrated once; no breaking change for users who already have data.
- `.gitignore` updated to ignore `data/app.db*` by default (optional to commit).

## References

- Best practice for AI projects: persist structured data in a DB for reliability and future tooling.
