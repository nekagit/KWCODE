# ADR 0211 — Command palette: Download keyboard shortcuts as CSV

## Status

Accepted.

## Context

The Shortcuts help dialog (Shift+?) offers Download as Markdown, JSON, and CSV (ADR 0178). The command palette already has "Copy keyboard shortcuts" and "Download keyboard shortcuts" (Markdown, ADR 0207). Keyboard-first users had no way to download keyboard shortcuts as CSV from ⌘K. Adding a palette action that triggers the same CSV download as the Shortcuts dialog improves discoverability and keeps CSV export available from the palette.

## Decision

- Add a Command palette action **"Download keyboard shortcuts as CSV"** that:
  - Calls `downloadKeyboardShortcutsAsCsv()` from `@/lib/export-keyboard-shortcuts`, which triggers a file download (`keyboard-shortcuts-{timestamp}.csv`) with columns Group, Keys, Description and shows a success toast.
  - Closes the palette after invoking.
- Use **FileSpreadsheet** icon (Lucide).
- Place the entry after "Download keyboard shortcuts" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download keyboard shortcuts as CSV".
- No new modules; reuse existing `downloadKeyboardShortcutsAsCsv` from `export-keyboard-shortcuts.ts`.

## Consequences

- Users can export the keyboard shortcuts list as CSV from the Command palette (⌘K) without opening the Shortcuts dialog.
- Aligns with existing "Download keyboard shortcuts" (Markdown) and with run history (plain, JSON, Markdown, CSV) palette actions.
- Run `npm run verify` to confirm tests, build, and lint pass.
