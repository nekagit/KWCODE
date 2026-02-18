# ADR 0209 — Command palette: Download run history as Markdown

## Status

Accepted.

## Context

The Run tab offers "Download all" (plain text), "Download as JSON", "Download as CSV", and "Download as Markdown". The command palette already has "Download run history" (plain) and "Download run history as JSON". Keyboard-first users had no way to download run history as Markdown from ⌘K. Adding a palette action that triggers the same Markdown download as the Run tab improves discoverability and keeps Markdown export available from the palette.

## Decision

- Add a Command palette action **"Download run history as Markdown"** that:
  - Reads `terminalOutputHistory` from the run store (same dataset as "Download run history" and "Download run history as JSON").
  - Calls `downloadAllRunHistoryMarkdown(terminalOutputHistory)` from `@/lib/download-all-run-history-md`, which triggers a file download (`run-history-{timestamp}.md`) with the same format as the Run tab "Download as Markdown" and shows a success or "No history to export" toast.
  - Closes the palette after invoking.
- Use **FileText** icon (Lucide).
- Place the entry after "Download run history as JSON" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download run history as Markdown".
- No new modules; reuse existing `download-all-run-history-md` and run store.

## Consequences

- Users can export the full run history as Markdown from the Command palette (⌘K) without opening the Run tab.
- Aligns with existing "Download run history" (plain) and "Download run history as JSON" behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
