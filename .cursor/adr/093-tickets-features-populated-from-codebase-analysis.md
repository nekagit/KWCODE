# ADR 093: tickets.md and features.md populated from codebase analysis

## Status

Accepted.

## Context

The project uses `.cursor/tickets.md` (work items in checklist format) and `.cursor/features.md` (features roadmap derived from tickets) for the project details Todos tab and Kanban. The format is defined in `.cursor/tickets-format.md` and `.cursor/features-tickets-correlation.md`; `.cursor/sync.md` describes what must stay in sync. The existing files were placeholders (e.g. "add feature", "add ticket") with no real content, so the Kanban and Tickets/Features cards had nothing to display or validate.

## Decision

1. **Create both files in one run from codebase analysis**
   - Populate `.cursor/tickets.md` with work items (tickets) derived from actual codebase analysis: Done vs Missing tables, then prioritized checklist items (P0–P3) under `#### Feature: <name>`.
   - Populate `.cursor/features.md` with major features in priority order, each referencing one or more ticket numbers from `tickets.md`, so both files stay in sync and the Kanban/JSON parser works.

2. **Structure (tickets.md)**
   - Follow required sections: Title, Metadata, Summary (Done / Missing), Prioritized work items with P0–P3, each with `#### Feature: <name>` and GFM checklist lines `- [ ] #N Title — description` or `- [x] #N ...`.
   - Feature names used: Tickets and features format; Project details — Todos tab and Kanban; API and error handling; Run and scripts; Quality and maintainability; Polish and scale; Later.

3. **Structure (features.md)**
   - Short intro stating features are derived from `.cursor/tickets.md`.
   - Checklist of major features with ticket refs: `- [ ] Feature name — #1, #2`, same feature names and numbers as in `tickets.md`.

4. **Content basis**
   - Done: from existing implemented areas (dashboard, tickets, features, run, projects, spec, Todos tab, Kanban, API file read, error handling, configuration, export, design/architecture/ideas/prompts, root loading overlay).
   - Missing: from gaps (placeholder tickets/features, API validation, auth, run history, OPENAI UI, tests, error boundaries, accessibility, project sync, i18n, offline/PWA).
   - Tickets #1–#17 cover: populating tickets/features (#1–#2), Sync and Analysis behavior (#3–#4), API and run improvements (#5–#8), quality (#9–#12), polish (#13–#15), later (#16–#17).

## Consequences

- The project details Todos tab and Kanban have real content to display and validate; Sync can check correlation meaningfully.
- Analysis: Tickets can be re-run to refresh from the codebase; this ADR documents the initial population so future updates follow the same format and correlation rules.
- Both files are written in one run so feature names and ticket numbers match, per `.cursor/features-tickets-correlation.md` and `.cursor/sync.md`.
