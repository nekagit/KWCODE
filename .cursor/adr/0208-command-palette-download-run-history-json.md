# ADR 0208 — Command palette: Download run history as JSON

## Status

Accepted.

## Context

The Run tab offers "Download all" (plain text), "Download as JSON", "Download as CSV", and "Download as Markdown". The command palette already has "Download run history" (plain) and "Copy run history to clipboard" (plain). Keyboard-first users had no way to download run history as JSON from ⌘K. Adding a palette action that triggers the same JSON download as the Run tab improves discoverability and keeps structured export available from the palette.

## Decision

- Add a Command palette action **"Download run history as JSON"** that:
  - Reads `terminalOutputHistory` from the run store (same dataset as "Download run history" and "Copy run history to clipboard").
  - Calls `downloadAllRunHistoryJson(terminalOutputHistory)` from `@/lib/download-all-run-history-json`, which triggers a file download (`run-history-{timestamp}.json`) with payload `{ exportedAt, entries }` and shows a success or "No history to export" toast.
  - Closes the palette after invoking.
- Use **FileJson** icon (Lucide).
- Place the entry after "Download run history" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download run history as JSON".
- No new modules; reuse existing `download-all-run-history-json` and run store.

## Consequences

- Users can export the full run history as JSON from the Command palette (⌘K) without opening the Run tab.
- Aligns with existing "Download run history" (plain) and Run tab "Download as JSON" behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
