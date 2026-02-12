# ADR: Move tickets.md and features.md to .cursor/planner/

## Date
2026-02-12

## Status
Accepted

## Context
The app and Tauri backend read/wrote `.cursor/tickets.md` and `.cursor/features.md` at the repo root. When those files were missing (e.g. repo had `.cursor/planner/tickets.md` instead), users saw: `ERROR: .CURSOR/FEATURES.MD: FILE NOT FOUND OR NOT ACCESSIBLE. NO SUCH FILE OR DIRECTORY (OS ERROR 2)`. The user requested changing the path for these files to `.cursor/planner/`.

## Decision
- **Canonical paths** for Kanban and planner data are now:
  - `.cursor/planner/tickets.md`
  - `.cursor/planner/features.md`
- All reads/writes in the app (ProjectTicketsTab, ProjectRunTab), Tauri (archive_cursor_file, default content), API (data route, generate-prompt-from-kanban, generate-ticket-from-prompt), scaffold script, and docs/comments use these paths.
- The scaffold script creates `.cursor/planner/` and writes both files there. The data API (GET /api/data) reads from `FEATURES_MD_PATH` and `TICKETS_MD_PATH` under `.cursor/planner/`.

## Consequences
- Repos that already have `.cursor/planner/tickets.md` and `.cursor/planner/features.md` work without change. New repos get files under `.cursor/planner/` when using the scaffold or when adding the first ticket via Planner Manager.
- The "file not found" error for the old root paths is resolved by both this path change and the existing graceful load (readProjectFileOrEmpty) for missing files.
