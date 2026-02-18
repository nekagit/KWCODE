# ADR 0210 — Command palette: Download run history as CSV

## Status

Accepted.

## Context

The Run tab offers "Download all" (plain text), "Download as JSON", "Download as CSV", and "Download as Markdown". The command palette already has "Download run history", "Download run history as JSON", and "Download run history as Markdown". Keyboard-first users had no way to download run history as CSV from ⌘K. Adding a palette action that triggers the same CSV download as the Run tab improves discoverability and keeps CSV export available from the palette.

## Decision

- Add a Command palette action **"Download run history as CSV"** that:
  - Reads `terminalOutputHistory` from the run store (same dataset as other run-history palette actions).
  - Calls `downloadAllRunHistoryCsv(terminalOutputHistory)` from `@/lib/download-all-run-history-csv`, which triggers a file download (`run-history-{timestamp}.csv`) with the same format as the Run tab "Download as CSV" (columns: timestamp, label, slot, exit_code, duration, output) and shows a success or "No history to export" toast.
  - Closes the palette after invoking.
- Use **FileSpreadsheet** icon (Lucide).
- Place the entry after "Download run history as Markdown" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download run history as CSV".
- No new modules; reuse existing `download-all-run-history-csv` and run store.

## Consequences

- Users can export the full run history as CSV from the Command palette (⌘K) without opening the Run tab.
- Aligns with existing "Download run history", "Download run history as JSON", and "Download run history as Markdown" behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
