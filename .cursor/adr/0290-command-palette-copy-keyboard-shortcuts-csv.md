# ADR 0290 — Command palette: Copy keyboard shortcuts as CSV

## Status

Accepted.

## Context

- The command palette (⌘K) already offers "Copy keyboard shortcuts" (Markdown), "Copy keyboard shortcuts as JSON", and "Download keyboard shortcuts as CSV" (ADR 0285 and related). Keyboard-first users could copy shortcuts as Markdown or JSON from the palette but had no way to **copy** the shortcuts list as CSV from ⌘K without opening the Shortcuts help dialog or downloading a file first.

## Decision

- Add **"Copy keyboard shortcuts as CSV"** to the command palette.
- Reuse existing `copyKeyboardShortcutsAsCsvToClipboard()` from `src/lib/export-keyboard-shortcuts.ts` (no new lib).
- **CommandPalette.tsx:** Import `copyKeyboardShortcutsAsCsvToClipboard`; add handler that calls it and closes the palette; add one action entry with FileSpreadsheet icon after "Copy keyboard shortcuts as JSON".
- **keyboard-shortcuts.ts:** Add one Command palette description: "Copy keyboard shortcuts as CSV".

## Consequences

- Users can copy the keyboard shortcuts list as CSV from the command palette in one action, with parity to Copy-as-Markdown and Copy-as-JSON.
- The action is documented in the Keyboard shortcuts help dialog.
