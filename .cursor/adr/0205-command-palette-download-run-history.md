# ADR 0205 — Command palette: Download run history

## Status

Accepted.

## Context

The Run tab has "Download all" (plain-text file) and the command palette already has "Copy run history to clipboard". Keyboard-first users had no way to download the full run history as a file without opening the Run tab. A palette action that triggers the same download as "Download all" (same dataset and format) improves discoverability and keeps export available from ⌘K.

## Decision

- Add a Command palette action **"Download run history"** that:
  - Reads `terminalOutputHistory` from the run store (same dataset as "Copy run history to clipboard" and "Clear run history").
  - Calls `downloadAllRunHistory(terminalOutputHistory)` from `@/lib/download-all-run-history`, which triggers a file download (`run-history-{timestamp}.txt`) and shows a success or "No history to export" toast.
  - Closes the palette after invoking.
- Use **Download** icon (Lucide).
- Place the entry after "Copy run history to clipboard" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download run history".
- No new modules; reuse existing `download-all-run-history` and run store.

## Consequences

- Users can export the full run history as a plain-text file from the Command palette (⌘K) without opening the Run tab.
- Aligns with existing "Copy run history to clipboard" and Run tab "Download all" behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
