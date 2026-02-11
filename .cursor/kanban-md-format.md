# Kanban round-trip format for `.cursor/tickets.md` and `.cursor/features.md`

This document describes the exact markdown format used so the project details Todo tab Kanban can load, display, and persist tickets and features. Cursor (AI) or a script can generate or update these files and they will parse correctly into the Kanban.

## Numbering system

- **Tickets**: Unique numbers `#1`, `#2`, `#3`, … in `tickets.md`. One ticket number per ticket. New tickets created in the Kanban get `nextNumber = max(existing ticket numbers) + 1`.
- **Features**: No separate feature number. Each feature is identified by its title and lists ticket refs (e.g. `#1, #2`). The same feature name must appear in `tickets.md` under `#### Feature: <name>` so both files stay in sync.

## tickets.md format

- **Required structure**: H1 title, metadata block (Project, Source, Last updated), horizontal rule, Summary (Done vs missing), horizontal rule, `## Prioritized work items (tickets)`, then priority blocks.
- **Priority blocks**: `### P0 — Critical / foundation`, `### P1 — High / quality and maintainability`, `### P2 — Medium / polish and scale`, `### P3 — Lower / later`.
- **Feature subsection**: Under each priority use `#### Feature: <feature_name>`.
- **Ticket line**: Exactly `- [ ] #N Title — description` for open, or `- [x] #N Title — description` for done. Space inside brackets; em dash `—` before description. Example: `- [ ] #1 Add unit tests — Set up Vitest`.

## features.md format

- **Intro**: Short paragraph stating features are derived from `.cursor/tickets.md`.
- **Section**: `## Major features`.
- **Feature line**: Exactly `- [ ] Feature name — #1, #2` or `- [x] Feature name — #1, #2`. Same ticket refs as in `tickets.md`. Example: `- [ ] Testing & quality — #1, #2`.

## Round-trip

- The Kanban loads from `.cursor/tickets.md` and `.cursor/features.md` when the project has a repo path.
- Creating or editing tickets and features in the Kanban writes back to these two files (Tauri `write_spec_file` or browser `POST /api/data/projects/[id]/file`).
- AI or scripts should follow this format so generated files parse into the Kanban without manual fixes.

See also: `.cursor/tickets-format.md`, `.cursor/features-tickets-correlation.md`.
