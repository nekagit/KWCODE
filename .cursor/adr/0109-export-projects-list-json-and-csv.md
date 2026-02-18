# ADR 0109 — Projects list: Export as JSON and CSV

## Status

Accepted.

## Context

The Projects list page shows all projects as cards with filter and sort. There was no way to export the project list as a file, unlike Ideas, Tickets, Designs, and Architectures, which support list-level "Download as JSON", "Download as CSV", and/or "Download as Markdown".

## Decision

- Add **`src/lib/download-projects-list-json.ts`** that:
  - Exposes `downloadProjectsListAsJson(projects)` with payload `{ exportedAt, count, projects }`.
  - Uses `filenameTimestamp` and `triggerFileDownload` from `download-helpers`. Filename: `projects-list-{timestamp}.json`.
  - Empty list shows toast and returns.
- Add **`src/lib/download-projects-list-csv.ts`** that:
  - Exposes `downloadProjectsListAsCsv(projects)` with columns: id, name, description, repo_path, run_port, created_at, updated_at, prompt_count, ticket_count, idea_count, design_count, architecture_count.
  - Uses `escapeCsvField` from `csv-helpers` and `filenameTimestamp` / `downloadBlob` from `download-helpers`. Filename: `projects-list-{timestamp}.csv`.
  - Empty list shows toast and returns.
- In **`ProjectsListPageContent`**, in the toolbar row (same row as filter and sort), add an **Export** group with **Download as JSON** and **Download as CSV** that operate on `displayList` (current filtered/sorted list). Buttons are only shown when there are projects.

## Consequences

- Users can export the current projects list (including filtered/sorted view) as JSON or CSV from the Projects page, consistent with other list-level exports in the app.
- Export logic lives in dedicated lib modules; the UI only wires the buttons.
- Aligns the Projects list with the export patterns used on Ideas, Tickets, Design, and Architecture.
