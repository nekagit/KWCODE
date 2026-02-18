# ADR 0160: Shortcuts help dialog — filter by action or keys

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog (Shift+?) shows all groups and shortcut rows in one long list. With many entries (Help, Command palette, Navigation, Dialogs, Quick actions), finding a specific shortcut (e.g. "Print" or "⌘K") required scanning the whole list. A text filter improves discoverability and matches the pattern used on Technologies, Prompts, and Ideas pages.

## Decision

- **ShortcutsHelpDialog.tsx**: Add a filter input above the scrollable table (Search icon, placeholder "Filter by action or keys…"). Filter is client-side only; no API or persistence.
- **Filter logic**: For each group, show only shortcut entries whose `keys` or `description` contains the query (case-insensitive). Empty query shows all groups and shortcuts. Groups with no matching shortcuts are hidden. When all groups have no matches, show a single message: "No shortcuts match \"…\"."
- **UI**: Filter input and optional "Clear" button when query is non-empty. Reuse Input + Search icon pattern from Technologies and Prompts pages.
- **Implementation**: Helper `filterShortcutGroups(groups, query)`; local state `filterQuery`; `useMemo` to compute `filteredGroups` from `KEYBOARD_SHORTCUT_GROUPS`.

## Consequences

- Users can quickly find a shortcut by typing part of the key combo or action description.
- Filter is session-only (resets when dialog closes if we ever clear on close; currently we keep query while dialog is open). No persistence.
- Groups with no matches disappear; empty state message when nothing matches.
