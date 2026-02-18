# ADR 0127 — Single run: Copy as JSON and Copy as CSV to clipboard

## Status

Accepted.

## Context

On the Run tab History section, each run row offers Download as JSON, Download as Markdown, Copy as Markdown, and Download as CSV. There was no way to copy a single run as JSON or CSV to the clipboard without creating a file. Users who want to paste one run into a script or spreadsheet had to download and then open the file. The list-level History row already has Copy as JSON and Copy as CSV; per-run copy was missing.

## Decision

- In **`src/lib/download-run-as-json.ts`**:
  - Extract **`buildRunJsonPayload(entry)`** (same shape as download); refactor `downloadRunAsJson` to use it.
  - Add async **`copyRunAsJsonToClipboard(entry)`** that builds the payload, copies via `copyTextToClipboard`, and shows "Run copied as JSON" or "Failed to copy to clipboard" toast.
- In **`src/lib/download-run-as-csv.ts`**:
  - Extract **`buildRunCsv(entry)`** (same columns/escape logic as download); refactor `downloadRunAsCsv` to use it.
  - Add async **`copyRunAsCsvToClipboard(entry)`** that builds CSV, copies via `copyTextToClipboard`, and shows the same toasts.
- In **ProjectRunTab**: (1) In the History table row actions (next to Copy MD), add "Copy JSON" and "Copy CSV" buttons. (2) In the expanded run panel (next to Copy as Markdown), add "Copy as JSON" and "Copy as CSV" buttons.

## Consequences

- Users can copy a single run as JSON or CSV to the clipboard from both the table row and the expanded panel.
- Same payload/columns as the existing Download as JSON/CSV for a single run.
- Aligns with list-level run history copy and other copy-as-JSON/CSV patterns in the app.
