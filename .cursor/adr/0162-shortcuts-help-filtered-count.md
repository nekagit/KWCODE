# ADR 0162: Shortcuts help dialog — show filtered count when filter is active

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog (Shift+?) has a filter that narrows the list by keys or action description. When the user types a query, groups with no matches are hidden and only matching shortcut rows are shown. There was no indication of how many shortcuts matched (e.g. "5 of 42"). Users had no quick way to see whether the filter narrowed the list significantly. The Technologies page and Run history already show "Showing X of Y" when filtered; the shortcuts dialog did not.

## Decision

- **ShortcutsHelpDialog.tsx**: When the filter is active and there is at least one matching shortcut, show a "Showing X of Y shortcuts" line next to or below the filter row. X = sum of shortcut counts in the filtered groups; Y = total shortcut count from `KEYBOARD_SHORTCUT_GROUPS`. Use a constant total (e.g. computed once from `KEYBOARD_SHORTCUT_GROUPS`) and `useMemo` for the filtered count from `filteredGroups`. Style as muted, small text (e.g. `text-xs text-muted-foreground`). Do not show the count when the filter is empty or when there are no matches (empty state message is sufficient).

## Consequences

- Users get clear feedback on how many shortcuts match the filter, consistent with other filtered lists in the app.
- No new dependencies or APIs; client-side only.
- Minimal change: one constant, one useMemo, one conditional line in the dialog.
