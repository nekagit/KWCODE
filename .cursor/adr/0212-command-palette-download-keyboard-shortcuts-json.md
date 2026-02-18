# ADR 0212 — Command palette: Download keyboard shortcuts as JSON

## Status

Accepted.

## Context

The Shortcuts help dialog (Shift+?) offers Download as Markdown, JSON, and CSV (ADR 0178). The command palette already has "Download keyboard shortcuts" (Markdown, ADR 0207) and "Download keyboard shortcuts as CSV" (ADR 0211). Keyboard-first users had no way to download keyboard shortcuts as JSON from ⌘K. Adding a palette action that triggers the same JSON download as the Shortcuts dialog improves discoverability and keeps JSON export available from the palette, consistent with run history (plain, JSON, Markdown, CSV) and keyboard shortcuts (Markdown, CSV) palette actions.

## Decision

- Add a Command palette action **"Download keyboard shortcuts as JSON"** that:
  - Calls `downloadKeyboardShortcutsAsJson()` from `@/lib/export-keyboard-shortcuts`, which triggers a file download (`keyboard-shortcuts-{timestamp}.json`) with `{ exportedAt, groups }` and shows a success toast.
  - Closes the palette after invoking.
- Use **FileJson** icon (Lucide).
- Place the entry after "Download keyboard shortcuts" and before "Download keyboard shortcuts as CSV" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download keyboard shortcuts as JSON".
- No new modules; reuse existing `downloadKeyboardShortcutsAsJson` from `export-keyboard-shortcuts.ts`.

## Consequences

- Users can export the keyboard shortcuts list as JSON from the Command palette (⌘K) without opening the Shortcuts dialog.
- Aligns with existing "Download keyboard shortcuts" (Markdown), "Download keyboard shortcuts as CSV", and with run history (plain, JSON, Markdown, CSV) palette actions.
- Run `npm run verify` to confirm tests, build, and lint pass.
