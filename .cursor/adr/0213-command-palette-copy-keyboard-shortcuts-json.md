# ADR 0213 — Command palette: Copy keyboard shortcuts as JSON

## Status

Accepted.

## Context

The Shortcuts help dialog (Shift+?) offers Copy as Markdown and Copy as JSON (ADR 0130). The command palette has "Copy keyboard shortcuts" (Markdown, ADR 0200) and Download as Markdown/JSON/CSV. Keyboard-first users had no way to copy keyboard shortcuts as JSON from ⌘K. Adding a palette action that triggers the same JSON copy as the Shortcuts dialog improves discoverability and keeps copy-as-JSON available from the palette.

## Decision

- Add a Command palette action **"Copy keyboard shortcuts as JSON"** that:
  - Calls `copyKeyboardShortcutsAsJsonToClipboard()` from `@/lib/export-keyboard-shortcuts`, which copies the same JSON payload as "Download as JSON" (exportedAt, groups) to the clipboard and shows a success or error toast.
  - Closes the palette after invoking.
- Use **FileJson** icon (Lucide).
- Place the entry after "Copy keyboard shortcuts" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Copy keyboard shortcuts as JSON".
- No new modules; reuse existing `copyKeyboardShortcutsAsJsonToClipboard` from `export-keyboard-shortcuts.ts`.

## Consequences

- Users can copy the keyboard shortcuts list as JSON from the Command palette (⌘K) without opening the Shortcuts dialog.
- Aligns with existing "Copy keyboard shortcuts" (Markdown) and with Download-as-JSON/CSV palette actions.
- Run `npm run verify` to confirm tests, build, and lint pass.
