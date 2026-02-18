# ADR 0254: Command palette — Focus filter

## Status

Accepted.

## Context

The app documents "/ (Dashboard)", "/ (Projects page)", "/ (Prompts page)", etc. as "Focus filter" in the keyboard shortcuts help. Each page with a filter uses a hook (`usePageFocusFilterShortcut`, `useProjectTabFocusFilterShortcut`, or `useShortcutsHelpFocusFilterShortcut`) so that pressing "/" focuses the filter input when on that page or tab. There was no way to trigger "focus the current page's filter" from the command palette (⌘K); keyboard-first users had to know to press "/" after navigating.

## Decision

- **New lib** `src/lib/focus-filter-event.ts`: Export a custom event name `FOCUS_FILTER_EVENT` ("kwcode-focus-filter") and `dispatchFocusFilterEvent()`. SSR-safe (no-op when `window` is undefined).
- **Command palette:** Add action "Focus filter" that closes the palette and calls `dispatchFocusFilterEvent()`.
- **Existing focus-filter hooks** listen for the event and focus their input when the current page/tab (or dialog open state) matches:
  - `usePageFocusFilterShortcut` — when pathname matches, focus input on FOCUS_FILTER_EVENT.
  - `useProjectTabFocusFilterShortcut` — when on project detail and tab matches, focus input on FOCUS_FILTER_EVENT.
  - `useShortcutsHelpFocusFilterShortcut` — when dialog is open, focus input on FOCUS_FILTER_EVENT.
- Document "Focus filter" in the Command palette group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can open ⌘K, type "focus filter" (or "filter"), and focus the filter input on the current page (Dashboard, Projects, Prompts, Ideas, Technologies, Run/Design/Architecture/Versioning tabs, or Shortcuts help dialog when open) without pressing "/".
- No new pages or routes; minimal touches to existing hooks and CommandPalette.
- Pattern is extensible: any future page with a filter that uses these hooks automatically gets command-palette "Focus filter" support.
