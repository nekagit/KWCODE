# ADR 0117 — Projects list: Copy as CSV to clipboard

## Status

Accepted.

## Context

The Projects list page has an Export row with "Download as JSON", "Copy as JSON", and "Download as CSV". Users could download the current filtered/sorted list as CSV but had no way to copy the same CSV to the clipboard for pasting into spreadsheets or scripts without creating a file.

## Decision

- In **`src/lib/download-projects-list-csv.ts`**, add **`copyProjectsListAsCsvToClipboard(projects: Project[])`**. Reuse the same CSV format as `downloadProjectsListAsCsv`: extract a shared **`buildProjectsListCsv(projects)`** that returns the CSV string (same columns and `escapeCsvField` logic); the download function uses it for the blob, and the copy function uses it with **`copyTextToClipboard(csv)`** from `@/lib/copy-to-clipboard`. Empty list: show "No projects to export" toast and return; on success show "Projects list copied as CSV".
- In **ProjectsListPageContent**, add a **Copy CSV** button in the Export row (Copy icon, next to the CSV download button), calling `copyProjectsListAsCsvToClipboard(displayList)`.

## Consequences

- Users can copy the current projects list as CSV to the clipboard, matching the pattern already used for JSON (Download + Copy) and improving workflow when a file is not needed.
- Single source of truth for CSV format: `buildProjectsListCsv` is used by both download and copy.
