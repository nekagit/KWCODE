# ADR 0202 — Command palette: Copy run history to clipboard

## Status

Accepted.

## Context

The Run tab History section has "Copy all" (plain text) and Copy as Markdown/JSON/CSV; those actions copy the visible (filtered/sorted) run history. Keyboard-first users had no way to copy run history from anywhere without opening the Run tab. The command palette already offers "Clear run history" and "Remove last run from history", which operate on the full terminal output history in the store.

## Decision

- Add a Command palette action **"Copy run history to clipboard"** that:
  - Reads `terminalOutputHistory` from the run store (same dataset as "Clear run history").
  - Calls `copyAllRunHistoryToClipboard(terminalOutputHistory)` from `@/lib/copy-all-run-history`, which copies plain text in the same format as the Run tab's "Copy all" and shows a success or "No history to copy" / "Failed to copy" toast.
  - Closes the palette after invoking.
- Use **Copy** icon (same as other copy actions).
- Place the entry after "Copy keyboard shortcuts" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Copy run history to clipboard".
- No new modules; reuse existing `copy-all-run-history` and run store.

## Consequences

- Users can copy the full run history (plain text) to the clipboard from the Command palette (⌘K) without opening the Run tab.
- Aligns with existing "Copy app info", "Copy first project path", "Copy data directory path", and "Copy keyboard shortcuts" actions.
- Run `npm run verify` to confirm tests, build, and lint pass.
