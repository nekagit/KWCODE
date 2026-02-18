# ADR 0157: Command palette — confirm before Clear run history

## Status

Accepted.

## Context

The Run tab already shows a confirmation dialog when the user clicks "Clear history" ("Clear run history? … This cannot be undone."). The Command palette action "Clear run history" previously cleared immediately with no confirmation, so a misclick or accidental trigger could wipe all run history. Behaviour was inconsistent between the two entry points.

## Decision

- **CommandPalette.tsx**: When the user selects "Clear run history" from the Command palette, close the palette and open a confirmation dialog (same copy as ProjectRunTab: "Clear run history?", body "1 run will be removed from history. This cannot be undone." / "X runs will be removed from history. This cannot be undone.", Cancel and destructive "Clear history" button). On confirm: call `clearTerminalOutputHistory()`, close dialog, toast. If run history is already empty, show an info toast and do not open the dialog.

## Consequences

- Clear run history is consistently gated by confirmation from both the Run tab and the Command palette.
- Accidental data loss from the palette is prevented.
- Users with no run history get an info message instead of an empty confirmation dialog.
