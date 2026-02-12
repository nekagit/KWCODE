# ADR: Add .cursor/tickets.md at workspace root to fix file-not-found error

## Date
2026-02-12

## Status
Accepted

## Context
The application and some tooling expect a file at `.cursor/tickets.md` (workspace root). When it was missing, users saw: `ERROR: .CURSOR/TICKETS.MD: FILE NOT FOUND OR NOT ACCESSIBLE. NO SUCH FILE OR DIRECTORY (OS ERROR 2)`. The repo had `.cursor/planner/tickets.md` but not `.cursor/tickets.md`. The data API (`src/app/api/data/route.ts`) and project Kanban flows read/write `.cursor/tickets.md` under project repo paths; at app root, the data route also reads `.cursor/tickets.md` for browser mode.

## Decision
- Create `.cursor/tickets.md` at the workspace root with the same structure as the planner tickets file (work items header, summary tables, prioritized work items, next steps).
- Keep `.cursor/planner/tickets.md` as the planner-specific copy; the root file satisfies the global expectation and can be kept in sync or used as the canonical workspace tickets file.

## Consequences
- The "file not found" error for `.cursor/tickets.md` is resolved.
- Workspace has a single root-level tickets file for tools and the data API that expect it.
- Format matches existing `.cursor/planner/tickets.md` and the scaffold in `script/scaffold-cursor-md.mjs`.
