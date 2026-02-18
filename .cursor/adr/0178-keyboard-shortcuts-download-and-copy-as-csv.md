# ADR 0178 — Keyboard shortcuts: Download as CSV and Copy as CSV

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog (Shift+?) supports Download/Copy as Markdown (ADR 0094) and as JSON (ADR 0130). Users who want to open the list in a spreadsheet (Excel, Google Sheets) had no CSV option. Adding CSV export (download file and copy to clipboard) completes the set of export formats and matches patterns used elsewhere in the app (e.g. run history, projects list).

## Decision

- In **`src/lib/export-keyboard-shortcuts.ts`**:
  - Export **`formatKeyboardShortcutsAsCsv(groups?)`** — returns CSV string with header `Group,Keys,Description` and one data row per shortcut; cells containing comma, quote, or newline are wrapped in double quotes with internal `"` escaped as `""`.
  - Export **`downloadKeyboardShortcutsAsCsv()`** — format CSV, `triggerFileDownload` with filename `keyboard-shortcuts-{filenameTimestamp()}.csv`, MIME `text/csv;charset=utf-8`, toast on success.
  - Export async **`copyKeyboardShortcutsAsCsvToClipboard()`** — format CSV, copy via `copyTextToClipboard`, toast success or "Failed to copy to clipboard".
- In **ShortcutsHelpDialog** footer, add **Copy as CSV** and **Download as CSV** buttons (Copy and FileSpreadsheet icons) with aria-labels and titles, following the same order as JSON (Copy then Download).

## Consequences

- Users can export keyboard shortcuts as CSV for spreadsheets; download and copy use the same format.
- CSV escaping follows RFC 4180-style rules so values with commas or quotes are handled correctly.
- Run `npm run verify` to confirm tests, build, and lint pass.
