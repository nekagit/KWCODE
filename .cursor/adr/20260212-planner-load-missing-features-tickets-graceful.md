# ADR: Planner tab – graceful load when .cursor/planner/features.md or .cursor/planner/tickets.md is missing

## Date
2026-02-12

## Status
Accepted

## Context
When opening the Planner tab for a project whose repo does not yet have `.cursor/features.md` or `.cursor/tickets.md`, the app tried to read both files and threw on the first missing one. Users saw an error like: `ERROR: .CURSOR/FEATURES.MD: FILE NOT FOUND OR NOT ACCESSIBLE. NO SUCH FILE OR DIRECTORY (OS ERROR 2)`. On some systems the path appears in uppercase in the error. The file is expected at `.cursor/features.md` (lowercase); the repo may not have a `.cursor` folder at all.

## Decision
- **Initial Kanban load** in the Planner tab (ProjectTicketsTab) now uses **readProjectFileOrEmpty** for `.cursor/tickets.md` and `.cursor/features.md` instead of **readProjectFile**. If a file is missing, the read returns empty string rather than throwing.
- **buildKanbanFromMd("", "")** is valid: empty content parses to empty tickets and features, so the Kanban renders with empty Backlog/Done and no features. The existing empty state and “Set a repo path…” message when there is no repo path are unchanged; when repo path is set but the files are missing, the user now sees the Planner with empty Kanban and can use Planner Manager to generate and add the first ticket (which creates the files on confirm).
- **readProjectFile** is still used everywhere else (e.g. after mark-done, add-ticket, archive) where we expect the file to exist; **readProjectFileOrEmpty** is only for the initial load so missing files do not block the UI.
- Added **readProjectFileOrEmpty** in `src/lib/api-projects.ts`: it calls readProjectFile and returns `""` on any error (e.g. file not found).

## Consequences
- No more “file not found” error on the Planner tab when `.cursor/features.md` or `.cursor/tickets.md` is missing. The tab loads with an empty Kanban.
- New or uninitialized repos can open the Planner and use “Generate ticket” to create the first ticket, which writes both files and creates `.cursor` if needed.
- The uppercase path in the error message was a side effect of the throw; with no throw for missing files, that message no longer appears for the initial load.
