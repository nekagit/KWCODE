# ADR 0149: Keyboard shortcuts help — add missing Command palette actions

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog (Shift+?) includes a "Command palette (⌘K / Ctrl+K)" group that lists the main actions available from the palette. The Command palette had been extended with "Open first project in Cursor", "Open first project in Terminal", and "Stop all runs", but these three were not listed in the shortcuts group. Users reading the help dialog could not discover those actions without opening the palette.

## Decision

- **keyboard-shortcuts.ts**: Add three shortcut rows to the "Command palette (⌘K / Ctrl+K)" group, in the same order as in CommandPalette: "Open first project in Cursor", "Open first project in Terminal", "Stop all runs" (inserted after "Go to Run", before "Clear run history").
- No change to CommandPalette itself; only the documented list is updated so the help dialog remains the single place to discover all palette actions.

## Consequences

- The Shortcuts help dialog now lists all current Command palette actions, including Open first project in Cursor, Open first project in Terminal, and Stop all runs.
- Export/copy of shortcuts (Markdown, JSON) includes these three entries.
- Future palette additions should be reflected in this group to keep docs in sync.
