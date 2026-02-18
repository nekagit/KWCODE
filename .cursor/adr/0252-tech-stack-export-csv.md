# ADR 0252: Tech stack export as CSV

## Status

Accepted.

## Context

The app exports tech stack as Markdown and JSON (command palette and Technologies page). Other entities (ideas, prompts, projects list, run history) support CSV export. Users had no spreadsheet-friendly export for the tech stack (category, technology, description).

## Decision

- Add **Download tech stack as CSV** and **Copy tech stack as CSV** in two places: (1) Command palette (⌘K), (2) Technologies page (Tech stack section), next to existing Markdown/JSON actions.
- **New lib** `src/lib/download-tech-stack-csv.ts`: Export `buildTechStackCsv(data)` (rows: category, technology, description; categories Frontend, Backend, Tooling), `downloadTechStackAsCsv(data)`, `copyTechStackAsCsvToClipboard(data)`. Use `escapeCsvField` from csv-helpers, `filenameTimestamp` and `triggerFileDownload` from download-helpers; toast on empty/success/fail.
- **CommandPalette.tsx:** Add `handleDownloadTechStackCsv` and `handleCopyTechStackCsv`; add two action entries with FileSpreadsheet icon after existing tech stack JSON entries.
- **keyboard-shortcuts.ts:** Add "Download tech stack as CSV" and "Copy tech stack as CSV" in the Command palette group.
- **TechnologiesPageContent.tsx:** Add "Download as CSV" and "Copy as CSV" buttons in the Tech stack section.

## Consequences

- Users can export or copy the tech stack as CSV from ⌘K or from the Technologies page for use in spreadsheets.
- CSV format: header `category,technology,description`; one row per technology with Frontend/Backend/Tooling as category.
- Run `npm run verify` to confirm tests, build, and lint pass.
