# ADR 0122 — Project tickets: Copy as JSON and Copy as CSV to clipboard

## Status

Accepted.

## Context

The Project Tickets tab (project details) has an Export row with "Download as JSON", "Download as CSV", "Download as Markdown", and "Copy as Markdown". Users could download the current ticket list as JSON or CSV but had no way to copy the same data to the clipboard for pasting into scripts or spreadsheets without creating a file. Other areas (Ideas, Projects list, Architecture tab) already offer both download and copy for JSON/CSV.

## Decision

- **JSON:** In **`src/lib/download-project-tickets-json.ts`**, add **`buildProjectTicketsJsonPayload(tickets)`** (same shape as download: `{ exportedAt, count, tickets }`) and **`copyProjectTicketsAsJsonToClipboard(tickets)`**. Refactor `downloadProjectTicketsAsJson` to use the payload builder. Copy uses **`copyTextToClipboard`** from `@/lib/copy-to-clipboard`. Empty list: show "No tickets to export" toast; on success show "Tickets copied as JSON"; on failure show "Failed to copy to clipboard".
- **CSV:** In **`src/lib/download-project-tickets-csv.ts`**, add **`buildProjectTicketsCsv(tickets)`** (same columns and `escapeCsvField` logic as download) and **`copyProjectTicketsAsCsvToClipboard(tickets)`**. Refactor `downloadProjectTicketsAsCsv` to use the builder. Copy uses `copyTextToClipboard`. Empty list: show "No tickets to export"; on success "Tickets copied as CSV"; on failure "Failed to copy to clipboard".
- In **ProjectTicketsTab**, add **Copy as JSON** and **Copy as CSV** buttons in the Export row (Copy icon, next to the corresponding Download buttons), calling the new functions with `kanbanData.tickets`.

## Consequences

- Users can copy the current project ticket list as JSON or CSV to the clipboard, matching the pattern used on Ideas, Projects list, and Architecture/Design tabs.
- Single source of truth for ticket JSON payload and CSV format: shared builders used by both download and copy.
