# ADR 0016: Control tab and SQLite-backed tickets, milestones, ideas, implementation log

## Status

Accepted

## Context

- Tickets were sourced from `.cursor/7. planner/tickets.md`; milestones from `.cursor/milestones/*.md`; ideas from `data/ideas.json`.
- There was no structured record of “this ticket run finished” or which files changed.
- The plan required: (1) a single source of truth for tickets, milestones, ideas, and implementation log; (2) every ticket tied to a milestone and an idea; (3) when a ticket Implement All run exits, record the run in an implementation log with file changes and summary; (4) a Control tab to view that log.

## Decision

- **Storage:** Use **SQLite** (`data/app.db`) for all structured data: **plan_tickets**, **milestones**, **ideas**, **implementation_log**, and **plan_kanban_state**. Next.js API uses `better-sqlite3`; Tauri uses `rusqlite` on the same DB path. No tickets.md or milestone .md files as data source; only setup and agents/prompts remain .md in `.cursor`.
- **Tickets:** CRUD via `GET/POST/PATCH/DELETE /api/data/projects/[id]/tickets` (and `.../tickets/[ticketId]`). Every ticket has required `milestone_id` and `idea_id`. Planner and Worker tabs load tickets from the API and persist changes there.
- **Milestones / Ideas:** CRUD via `.../milestones` and existing `/api/data/ideas`; ideas table in SQLite with one-time migration from `data/ideas.json`.
- **Run meta:** Extend `RunMeta` with `repoPath`, `ticketNumber`, `ticketTitle`, `milestoneId`, `ideaId`, `gitRefAtStart`. Worker passes this meta when starting Implement All for tickets; Tauri exposes `get_git_head(project_path)` to capture ref at run start.
- **On script-exited:** When a run has ticket meta, call Tauri `get_git_diff_name_status(project_path, from_ref)` to get file changes, build a short summary, and `POST /api/data/projects/[id]/implementation-log` to append an entry.
- **Control tab:** New tab “Control” in the project details page; `ProjectControlTab` loads implementation log from the API and displays entries (ticket, milestone + idea, files changed, summary).

## Consequences

- Single source of truth for tickets, milestones, ideas, and implementation log; no drift between .md files and app state.
- Implement All runs for tickets are recorded with intention (milestone + idea) and file changes, improving traceability.
- Planner and Worker must have at least one milestone and one idea (or linked ideas) to add tickets; empty state messaging guides users to create them first.

## References

- Plan: `.cursor/plans/control_tab_and_ticket_assignment_12f7aefe.plan.md`
- `src/lib/db.ts` — SQLite schema and access (Next.js)
- `src-tauri/src/db.rs` — same tables for Tauri
- `src/app/api/data/projects/[id]/tickets|milestones|implementation-log|kanban-state` — API routes
- `src/store/run-store-hydration.tsx` — script-exited → implementation_log
- `src/components/molecules/TabAndContentSections/ProjectControlTab.tsx` — Control tab UI
