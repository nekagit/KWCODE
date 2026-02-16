# ADR 0028: Planner migration to `.cursor/7. planner`

## Status

Accepted

## Context

- Planner content (tickets.md, features.md, kanban-state.json, ticket-templates/, ai-suggestions/) lived at `.cursor/planner/`.
- Other entity folders use numbered names: `0. ideas`, `1. project`. Aligning planner with this convention improves consistency and discoverability.

## Decision

- **Move planner to `.cursor/7. planner`.** All planner paths in code, templates, and documentation use `.cursor/7. planner`.
- **Single source of truth:** `src/lib/cursor-paths.ts` exports `PLANNER_ROOT`, `PLANNER_TICKETS_PATH`, `PLANNER_FEATURES_PATH`, `PLANNER_KANBAN_STATE_PATH`. Frontend (e.g. `PlannerFilesSection`) and API routes use these constants or the same path string.
- **Template and repo:** `.cursor_template/planner` renamed to `.cursor_template/7. planner`. This repo’s `.cursor/planner` moved to `.cursor/7. planner`. All in-file references updated to `.cursor/7. planner`.
- **Tauri:** `archive_cursor_file` in `src-tauri/src/lib.rs` reads/writes `.cursor/7. planner/tickets.md` and `.cursor/7. planner/features.md`.

## Consequences

- Planner tab lists files under `.cursor/7. planner` and ticket stats from `.cursor/7. planner/tickets.md`. Dashboard and data APIs that read from the app’s `.cursor` use the new path.
- New projects created from the template get `.cursor/7. planner`; no `planner` folder.
- Existing project repos that still have `.cursor/planner` must migrate (move contents to `.cursor/7. planner`) if they rely on file-based planner paths.

## References

- `src/lib/cursor-paths.ts` — PLANNER_ROOT, PLANNER_TICKETS_PATH, PLANNER_FEATURES_PATH, PLANNER_KANBAN_STATE_PATH
- `src/components/molecules/TabAndContentSections/PlannerFilesSection.tsx` — uses PLANNER_ROOT, PLANNER_TICKETS_PATH
- `src-tauri/src/lib.rs` — archive_cursor_file paths
- `.cursor/7. planner/`, `.cursor_template/7. planner/` — current planner layout
- ADR 0021 — numbered entity folders (0. ideas, 1. project); planner/worker noted as optional follow-up
