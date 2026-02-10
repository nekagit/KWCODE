# ADR 110: Tickets and features populated from codebase analysis

## Status
Accepted

## Context
- `.cursor/tickets.md` and `.cursor/features.md` had been archived and reset to minimal placeholders. The project details page (Todos tab, Kanban) and JSON export depend on these files following the exact format in `.cursor/tickets-format.md` and `.cursor/features-tickets-correlation.md`.
- A senior-engineer-style analysis was needed to (1) fill tickets from the actual codebase (implemented vs missing), (2) categorize work by feature and priority (P0–P3), and (3) keep `tickets.md` and `features.md` in sync so the Kanban/JSON parser and display work correctly.

## Decision

1. **Single run producing both files**
   - Analysis was run once to create **both** `.cursor/tickets.md` and `.cursor/features.md` in the same pass, so feature names and ticket numbers stay aligned (per ADR 109 and `.cursor/sync.md`).

2. **Content based on actual codebase**
   - **Summary: Done vs missing** was derived from `.cursor/ANALYSIS.md` and the codebase: dashboard, tickets, features, run, projects, project detail (including Kanban load/sync/archive and JSON on .md load), prompts, ideas, design, architecture, configuration, data tab, seed template, and Tauri backend are listed as done; testing, API auth/validation, resilience, UX/maintainability, project sync, run history, and i18n are listed as gaps.

3. **Prioritized tickets by feature**
   - **P0:** Testing & quality (#1, #2), API security & validation (#3, #4).
   - **P1:** Resilience (#5, #6), Project details & Kanban (#7, #8), Data & configuration (#9, #10), UX & accessibility (#11, #12).
   - **P2:** Run & automation (#13, #14), UX & accessibility (#15), Data & configuration (#16).
   - **P3:** Internationalization (#17), Resilience (#18).
   - Every ticket appears under exactly one `#### Feature:` subsection. Feature names match the checklist entries in `features.md` with the same ticket refs.

4. **Format compliance for Kanban/JSON**
   - Ticket lines use the exact pattern: `- [ ] #N Title — description` or `- [x] #N Title — description` (space inside brackets; em dash before description).
   - Feature lines use: `- [ ] Feature name — #1, #2` (em dash before ticket refs).
   - Required sections (Title, Metadata, Summary, P0–P3 with Feature subsections, Next steps) are present so the project details page and `src/lib/todos-kanban.ts` parse correctly.

## Consequences
- The project has a concrete, codebase-grounded backlog in checklist form; items can be checked off as work is completed.
- Features and tickets stay correlated; Kanban and JSON export will parse as long as edits preserve the documented format.
- Future analysis runs (e.g. from the Tickets card) can regenerate both files in one run to keep them in sync.
