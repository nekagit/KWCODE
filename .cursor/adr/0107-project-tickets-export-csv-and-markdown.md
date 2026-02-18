# ADR 0107 — Project tickets: Export as CSV and Markdown

## Status

Accepted.

## Context

The Tickets tab on the project details page shows the project’s tickets in a Kanban view. There was no way to export or copy the ticket list as a file or clipboard content, unlike Run history, Ideas, Prompts, and Design/Architecture tabs, which support list-level "Download as CSV", "Download as Markdown", and "Copy as Markdown".

## Decision

- Add **`src/lib/download-project-tickets-md.ts`** that:
  - Builds a single Markdown string for a list of tickets (`buildProjectTicketsMarkdown(tickets, options?)`), with optional `projectName` for the header.
  - Format: `# Project tickets`, project name, export timestamp, count, then each ticket as a section (number, title, priority, status, featureName, description).
  - Exposes `downloadProjectTicketsAsMarkdown(tickets, options?)` and `copyProjectTicketsAsMarkdownToClipboard(tickets, options?)` using `download-helpers` and `copy-to-clipboard`.
- Add **`src/lib/download-project-tickets-csv.ts`** that:
  - Exposes `downloadProjectTicketsAsCsv(tickets)` with columns: id, number, title, description, priority, feature_name, status, done.
  - Uses `escapeCsvField` from `csv-helpers` and `filenameTimestamp` / `downloadBlob` from `download-helpers`.
- In **`ProjectTicketsTab`**, in the Project Planner section (after Overall Progress, before the Kanban board), add an **Export** row with **Download as CSV**, **Download as Markdown**, and **Copy as Markdown** that operate on `kanbanData.tickets`. Buttons are disabled when there are no tickets.

## Consequences

- Users can export or copy the current project’s ticket list as CSV or Markdown from the Tickets tab, consistent with other list-level exports in the app.
- Export logic lives in dedicated lib modules; the UI only wires the buttons.
- Aligns the Tickets tab with the export/copy patterns used on Run history, Ideas, Prompts, Design, and Architecture.
