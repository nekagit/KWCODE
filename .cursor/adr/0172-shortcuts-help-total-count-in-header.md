# ADR 0172: Shortcuts help dialog — total count in header

## Status

Accepted.

## Context

The Keyboard shortcuts dialog (Shift+?) lists all shortcut groups and rows. When the user applies a filter, the dialog shows "Showing X of Y shortcuts" so they know how many matches there are. When no filter is applied, there was no indication of the total number of shortcuts, making it harder to get at-a-glance context (e.g. "how many shortcuts does this app have?").

## Decision

- **ShortcutsHelpDialog.tsx**: Display the total shortcut count in the dialog title. Use the existing `totalShortcutCount` (already computed from `KEYBOARD_SHORTCUT_GROUPS`) and render the title as "Keyboard shortcuts (42)" (or the actual count). No new lib or store; the count is derived from the same data used for the list.

## Consequences

- Users see how many shortcuts exist as soon as they open the dialog, without applying a filter.
- Aligns with the existing "Showing X of Y shortcuts" pattern when a filter is active (Y is the same total).
- Single touch to ShortcutsHelpDialog; no API or persistence changes.
