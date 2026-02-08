# ADR 088: Todos tab Sync button and .cursor/sync.md

## Status

Accepted.

## Context

Users need a way to verify that `.cursor/features.md` and `.cursor/tickets.md` are correlating and up to date, following the standards in `.cursor/features-tickets-correlation.md` and `.cursor/tickets-format.md`. There was no single place documenting what must be synced or a one-click check on the project details page.

## Decision

1. **Sync button on project details → Todos tab**
   - Add a **Sync** button in the Todos tab (above the accordion) that runs a correlation and format check.
   - Button is disabled when the project has no repo path or while the check is running.
   - On click: fetch `.cursor/features.md` and `.cursor/tickets.md` from the project repo (same mechanism as the Features/Tickets cards: Tauri `read_file_text_under_root` or `GET /api/data/projects/[id]/file?path=...`), then run client-side checks.
   - Show result in an inline message below the button: green when in sync, amber when issues are found, with a short message and optional detail list (e.g. “Ticket #3 in features.md not found in tickets.md”).

2. **Sync checks (first iteration)**
   - Ensure every ticket number referenced in `features.md` exists in `tickets.md` (checklist lines with `#N`).
   - Ensure feature checklist lines in `features.md` reference at least one ticket (`#N`).
   - If either file is missing or empty, report accordingly and suggest creating both via Analysis: Tickets.

3. **.cursor/sync.md**
   - Create a document that lists everything that needs to be synced and how to fix drift.
   - **First two items (in order):**
     - **1. features.md and tickets.md correlation** — rule, checks (feature→ticket refs, ticket numbers exist in tickets.md, feature names aligned), reference to features-tickets-correlation.md and tickets-format.md, and what to do when out of sync.
     - **2. tickets.md format and structure** — required sections, checklist-by-feature format, reference to tickets-format.md.
   - Document is extensible (e.g. future items: spec files vs repo, design/architecture exports).
   - The Todos tab copy references “see .cursor/sync.md” so users know where the full checklist lives.

## Consequences

- Users can quickly verify features/tickets alignment from the Todos tab without opening files.
- A single source of truth (sync.md) describes what to sync and best practice; the Sync button implements the first two checks.
- Sync logic is client-side only; no new API. Reuses existing project file read (Tauri or project file API).
