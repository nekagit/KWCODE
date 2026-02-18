# ADR 0207 — Command palette: Download keyboard shortcuts

## Status

Accepted.

## Context

The Command palette has "Copy keyboard shortcuts" (ADR 0200), which copies the shortcuts list as Markdown to the clipboard. The Shortcuts help dialog (Shift+?) and Configuration offer Download as Markdown, JSON, and CSV. Keyboard-first users had no way to download the shortcuts as a file from ⌘K without opening the dialog or Configuration. A palette action that triggers the same Markdown download as the dialog improves discoverability and keeps export available from ⌘K.

## Decision

- Add a Command palette action **"Download keyboard shortcuts"** that:
  - Calls `downloadKeyboardShortcutsAsMarkdown()` from `@/lib/export-keyboard-shortcuts`, which triggers a file download (`keyboard-shortcuts-{timestamp}.md`) and shows a success toast.
  - Closes the palette after invoking.
- Use **Download** icon (Lucide).
- Place the entry after "Copy keyboard shortcuts" in the action list.
- Add one entry in `src/data/keyboard-shortcuts.ts` in the Command palette group: "Download keyboard shortcuts".
- No new modules; reuse existing `export-keyboard-shortcuts`.

## Consequences

- Users can export the keyboard shortcuts list as a Markdown file from the Command palette (⌘K) without opening the shortcuts dialog or Configuration.
- Aligns with existing "Copy keyboard shortcuts" and "Download run history" / "Download app info" palette actions.
- Run `npm run verify` to confirm tests, build, and lint pass.
