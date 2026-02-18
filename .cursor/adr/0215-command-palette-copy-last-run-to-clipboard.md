# ADR 0215 — Command palette: Copy last run to clipboard

## Status

Accepted.

## Context

The command palette has "Copy run history to clipboard" (full history as plain text) and the Run tab has per-run "Copy plain" for a single run (ADR 0204). Keyboard-first users had no way to copy only the most recent run as plain text from ⌘K without opening the Run tab. Adding a palette action that copies the latest run (same format as "Copy plain" for one run) improves workflow for users who want to paste the last run output quickly.

## Decision

- Add a Command palette action **"Copy last run to clipboard"** that:
  - Reads the most recent run from `terminalOutputHistory[0]` (from run store).
  - If present: calls `copySingleRunAsPlainTextToClipboard(entry)` from `@/lib/copy-single-run-as-plain-text` (same format as Run tab "Copy plain"; shows "Run copied to clipboard" toast).
  - If empty: shows `toast.info("No run history to copy")`.
  - Closes the palette after invoking.
- Use **Copy** icon (Lucide).
- Place the entry after "Copy run history to clipboard" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Copy last run to clipboard".
- No new modules; reuse existing `copySingleRunAsPlainTextToClipboard` from `copy-single-run-as-plain-text.ts`.

## Consequences

- Users can copy the most recent run output as plain text from the Command palette (⌘K) without opening the Run tab.
- Aligns with existing "Copy run history to clipboard" and Run tab single-run "Copy plain" behaviour.
- Run `npm run verify` to confirm tests, build, and lint pass.
