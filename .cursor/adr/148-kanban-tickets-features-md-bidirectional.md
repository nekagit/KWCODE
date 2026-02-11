# ADR 148: Kanban tickets and features .md bidirectional sync

## Status

Accepted.

## Context

The project details Todo tab had a Kanban UI for tickets but data was disconnected: it used `project.ticketIds` and `project.featureIds` (arrays of IDs) while the real source of truth is `.cursor/tickets.md` and `.cursor/features.md`. Users wanted to (1) see current tickets and features in the Kanban loaded from these .md files, (2) create and edit tickets and features in the Kanban and persist back to .md, and (3) generate .md with Cursor (AI) or a script using a checkbox + ticket/feature number format that round-trips to the Kanban.

## Decision

1. **Kanban as UI for current tickets and features**
   - Source of truth: `.cursor/tickets.md` and `.cursor/features.md` in the project repo.
   - When the project has a `repoPath`, the Todo tab loads both files (Tauri: `read_file_text_under_root`; browser: `GET /api/data/projects/[id]/file?path=...`), parses them with `parseTicketsMd` and `parseFeaturesMd`, and builds Kanban data with `buildKanbanFromMd`. Column mapping: `ticket.done` → Done column; `!ticket.done` → Backlog. In progress and Blocked columns remain empty unless the format is extended later.

2. **Create/edit in Kanban persists to .md**
   - Serializers: `serializeTicketsToMd` and `serializeFeaturesToMd` in `src/lib/todos-kanban.ts` produce full .md content. Writing: Tauri uses `write_spec_file`; browser uses new `POST /api/data/projects/[id]/file` (same path/security checks as GET). Frontend helpers: `readProjectFile(projectId, path, repoPath?)` and `writeProjectFile(projectId, path, content, repoPath?)` in `src/lib/api-projects.ts`.
   - Add ticket: User enters title, description, priority (P0–P3), feature (existing or new). Next ticket number = `max(existing) + 1`. Append ticket and optionally new/updated feature; serialize both .md; write both.
   - Add feature: User enters title and ticket refs (#1, #2); append to features; serialize and write `features.md`.
   - Mark ticket done: Re-serialize `tickets.md`, write; if the feature’s tickets are all done, mark feature line in `features.md` and write.
   - Mark feature done: Mark that feature’s tickets done in `tickets.md` and the feature line in `features.md`; write both.

3. **Checkbox + ticket # / feature refs format for AI/script**
   - Documented in `.cursor/kanban-md-format.md`: tickets as `- [ ] #N Title — description` under `#### Feature: Name` and `### P0`…`P3`; features as `- [ ] Feature name — #1, #2`. One ticket number per ticket; feature = title + list of #N refs. Cursor or a script can generate/update these two files and they parse into the Kanban.

## Consequences

- Kanban and .md stay in sync when editing from the app. Browser mode can persist via POST project file. Format doc and ADR give a single reference for AI/script generation and round-trip behavior.
