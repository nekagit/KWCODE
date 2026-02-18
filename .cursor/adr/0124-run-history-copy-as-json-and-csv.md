# ADR 0124 — Run history: Copy as JSON and Copy as CSV to clipboard

## Status

Accepted.

## Context

The Run tab History section has "Copy all" (plain text), "Copy as Markdown", and Download as CSV/JSON/Markdown. There was no way to copy the visible run history as JSON or CSV to the clipboard. Users who want to paste the history into spreadsheets or scripts without creating a file had no clipboard JSON/CSV option. This is inconsistent with Ideas, Projects list, Project tickets, and Configuration, which offer both download and copy-as-JSON/CSV.

## Decision

- In **`src/lib/download-all-run-history-json.ts`**:
  - Extract **`buildRunHistoryJsonPayload(entries)`** (payload: `{ exportedAt, entries }`); refactor `downloadAllRunHistoryJson` to use it.
  - Add async **`copyAllRunHistoryJsonToClipboard(entries)`** that builds the same payload, copies pretty-printed JSON via `copyTextToClipboard`, and shows success or "No history to export" / "Failed to copy to clipboard" toast.
- In **`src/lib/download-all-run-history-csv.ts`**:
  - Extract **`buildRunHistoryCsv(entries)`** (same columns/escape logic as download); refactor `downloadAllRunHistoryCsv` to use it.
  - Add async **`copyAllRunHistoryCsvToClipboard(entries)`** that builds CSV, copies via `copyTextToClipboard`, and shows the same toasts.
- In **ProjectRunTab**, in the History row next to "Copy as Markdown", add **Copy as JSON** and **Copy as CSV** buttons (Copy icon) that call the new functions with `displayHistory`.

## Consequences

- Users can copy the visible run history as JSON or CSV to the clipboard from the Run tab without downloading a file.
- Same payload/columns as the existing Download as JSON/CSV; only the delivery (clipboard vs file) differs.
- Aligns with existing copy-as-JSON/CSV patterns across the app.
