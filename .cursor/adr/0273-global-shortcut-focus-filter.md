# ADR 0273: Global keyboard shortcut — Focus filter

## Status

Accepted.

## Context

ADR 0254 added a "Focus filter" command-palette action that dispatches `FOCUS_FILTER_EVENT` so the current page's filter input is focused. The shortcuts help documents "/" on specific pages (Dashboard, Projects, Prompts, etc.) for focus filter. There was no **global** shortcut to trigger focus filter from anywhere; users had to open the palette (⌘K) and run "Focus filter", or be on a page and press "/".

## Decision

- **CommandPalette.tsx:** Add a global keydown listener: when the palette is not open and focus is not in INPUT/TEXTAREA/SELECT, **⌘⇧/ (Mac) / Ctrl+Alt+/ (Windows/Linux)** calls `dispatchFocusFilterEvent()` and prevents default. Same guard pattern as other global shortcuts (Go to Design, Focus main content, etc.).
- **keyboard-shortcuts.ts:** Add one Help-group entry: "Focus filter (global)" with keys "⌘⇧/ / Ctrl+Alt+/", placed after "Focus main content".

## Consequences

- Users can focus the current page's filter from anywhere with one shortcut, without opening the command palette or first navigating to the page.
- Pages that already listen for `FOCUS_FILTER_EVENT` (Dashboard, Projects, Prompts, Ideas, Technologies, Run/Design/Architecture/Versioning tabs, Shortcuts dialog) automatically benefit.
- No new modules; reuses `dispatchFocusFilterEvent()` from `src/lib/focus-filter-event.ts`.
