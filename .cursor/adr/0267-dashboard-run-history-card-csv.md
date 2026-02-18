# ADR 0267: Dashboard Run history card — Download and Copy run history as CSV

## Status

Accepted.

## Context

The Run tab History toolbar and the command palette (⌘K) already offer "Download run history as CSV" and "Copy run history as CSV". The Dashboard Run history card (`RunHistoryStatsCard`) has Copy summary and Download/Copy stats as JSON (ADR 0263), but no way to export the **full run history as CSV** from the overview. Users on the Dashboard had to open the Run tab or command palette to get the same CSV export.

## Decision

- In **RunHistoryStatsCard.tsx**, add two buttons alongside the existing Copy summary and JSON buttons:
  - **"Download as CSV"** — calls `downloadAllRunHistoryCsv(entries)` from `@/lib/download-all-run-history-csv`.
  - **"Copy as CSV"** — calls `copyAllRunHistoryCsvToClipboard(entries)` from the same lib.
- Use the card’s **entries** prop so the exported CSV matches the in-memory run history (same columns: timestamp, label, slot, exit_code, duration, output).
- Both new buttons are disabled when `entries.length === 0`. Use the same styling as the JSON buttons (outline, sm, FileSpreadsheet icon). Layout: flex wrap so all buttons sit in one row and wrap on small screens.

## Consequences

- Users can export the full run history as CSV from the Dashboard overview without leaving the page or opening the command palette.
- Same format and behaviour as Run tab and command palette (single lib `download-all-run-history-csv`, consistent UX).
- Single touch to RunHistoryStatsCard; no new lib.
