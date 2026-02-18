# ADR 0119 — My Ideas: Copy as CSV to clipboard

## Status

Accepted.

## Context

The Ideas page has an Export row with "Export JSON", "Copy as JSON", "Export MD", "Copy as Markdown", and "Export CSV". Users could download the current (possibly filtered) ideas list as CSV but had no way to copy the same CSV to the clipboard for pasting into spreadsheets or scripts without creating a file.

## Decision

- In **`src/lib/download-my-ideas-csv.ts`**, add **`copyMyIdeasAsCsvToClipboard(ideas: IdeaRecord[])`**. Reuse the same CSV format as `downloadMyIdeasAsCsv`: extract a shared **`buildMyIdeasCsv(ideas)`** that returns the CSV string (same columns and `escapeCsvField` logic); the download function uses it for the blob, and the copy function uses it with **`copyTextToClipboard(csv)`** from `@/lib/copy-to-clipboard`. Empty list: show "No ideas to export" toast and return; on success show "Ideas copied as CSV"; on clipboard failure show "Failed to copy to clipboard".
- In **IdeasPageContent**, add a **Copy as CSV** button in the Export row (Copy icon, next to Export CSV), calling `copyMyIdeasAsCsvToClipboard` with the same list used for other exports (filtered/sorted when a filter is applied).

## Consequences

- Users can copy the current ideas list as CSV to the clipboard, matching the pattern already used for Ideas (Copy as JSON, Copy as Markdown) and for the Projects list (Copy as CSV).
- Single source of truth for ideas CSV format: `buildMyIdeasCsv` is used by both download and copy.
