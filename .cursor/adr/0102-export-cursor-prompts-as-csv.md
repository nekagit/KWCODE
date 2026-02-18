# ADR 0102 — Export .cursor prompts as CSV

## Status

Accepted.

## Context

The Prompts page has two tabs: ".cursor prompts" (file-based `*.prompt.md` under `.cursor/`) and "General" (DB-backed prompt records). General prompts support Export JSON, Export MD, Copy as Markdown, and **Export CSV**. The .cursor prompts tab had Export JSON, Export MD, and Copy as Markdown but no CSV export, creating an inconsistent experience and limiting use cases (e.g. spreadsheet analysis, bulk import elsewhere).

## Decision

- Add an **Export CSV** action for the .cursor prompts tab that downloads a single CSV file with columns: `relativePath`, `path`, `name`, `updatedAt`, `content`.
- Implement in a new module `src/lib/download-all-cursor-prompts-csv.ts`, reusing:
  - The same data source as JSON/MD: `GET /api/data/cursor-prompt-files-contents`.
  - `escapeCsvField` from `@/lib/csv-helpers` (RFC 4180-style escaping).
  - `filenameTimestamp` and `downloadBlob` from `@/lib/download-helpers`.
- Add an "Export CSV" button in `PromptRecordsPageContent` in the .cursor prompts export row, disabled when there are no files.

## Consequences

- .cursor prompts and general prompts now both offer CSV export, improving consistency.
- CSV content is escaped for commas, newlines, and quotes so content is safe for spreadsheets.
- No new API; same fetch as existing .cursor prompt exports.
