# ADR 0110 — Project tickets: Download list as JSON

## Status

Accepted.

## Context

The Tickets tab on the project details page lists that project's tickets (Kanban) and offers list-level "Download as CSV", "Download as Markdown", and "Copy as Markdown". There was no way to export the full visible ticket list as one JSON file, unlike the Design and Architecture tabs, which support list-level "Download as JSON" in addition to Markdown/CSV exports.

## Decision

- Add a shared module `src/lib/download-project-tickets-json.ts` that:
  - Exposes `downloadProjectTicketsAsJson(tickets: ParsedTicket[])`.
  - Payload: `{ exportedAt: string, count: number, tickets: ParsedTicket[] }`.
  - Filename: `project-tickets-{YYYY-MM-DD-HHmm}.json` using `filenameTimestamp` and `triggerFileDownload` from download-helpers.
  - Empty list shows a toast and returns.
- In `ProjectTicketsTab`, add a "Download as JSON" button in the Export row (before Download as CSV), operating on `kanbanData.tickets`, disabled when `totalTickets === 0`, with FileJson icon.

## Consequences

- Users can export all visible project tickets as one JSON file for scripting or integration, matching the list-level JSON export pattern used on the Design and Architecture tabs.
- Completes the export matrix for the project Tickets tab (JSON, CSV, Markdown, Copy as Markdown).
