# ADR 0200 — Command palette: Copy keyboard shortcuts

## Status

Accepted.

## Context

The Command palette (⌘K) has "Keyboard shortcuts", which opens the shortcuts help dialog. Configuration offers export of shortcuts as Markdown, JSON, or CSV (download or copy). Keyboard-first users had no way to copy the shortcuts list to the clipboard from anywhere without opening the dialog or going to Configuration. Copying the list is useful for pasting into docs, tickets, or sharing.

## Decision

- Add a Command palette action **"Copy keyboard shortcuts"** that:
  - Calls `copyKeyboardShortcutsAsMarkdownToClipboard()` from `@/lib/export-keyboard-shortcuts`, which copies the shortcuts list as Markdown (same format as the export) and uses `copyTextToClipboard`, which shows a success toast.
  - Closes the palette after the async call.
- Use **Copy** icon (same as other copy actions).
- Place the entry after "Copy data directory path" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Copy keyboard shortcuts".
- No new modules; reuse existing `export-keyboard-shortcuts` and `copy-to-clipboard`.

## Consequences

- Users can copy the keyboard shortcuts list (Markdown) to the clipboard from the Command palette (⌘K) without opening the shortcuts dialog or Configuration.
- Aligns with existing "Copy app info", "Copy first project path", and "Copy data directory path" actions.
- Run `npm run verify` to confirm tests, build, and lint pass.
