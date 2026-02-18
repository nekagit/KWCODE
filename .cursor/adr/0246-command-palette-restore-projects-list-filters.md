# ADR 0246: Command palette — Restore projects list filters

## Status

Accepted.

## Context

The app has "Restore run history filters" in the command palette (⌘K): it resets run history sort and filter preferences to defaults, persists them, and dispatches a custom event so the Run tab updates its local state. The Projects list page has "Reset filters" in the UI but no command-palette action; keyboard-first users could not restore projects list sort/filter from ⌘K.

## Decision

- In `src/lib/projects-list-view-preference.ts`, export a custom event name `PROJECTS_LIST_VIEW_PREFERENCE_RESTORED_EVENT` so CommandPalette and ProjectsListPageContent can share it.
- Add a command palette action "Restore projects list filters" that:
  - Closes the palette.
  - Calls `setProjectsListViewPreference(DEFAULT_PROJECTS_LIST_VIEW_PREFERENCE)` to persist default sort (asc) and empty filter.
  - Dispatches the custom event so any open Projects list page can sync its local state.
  - Shows a toast "Projects list filters restored to defaults."
- In `ProjectsListPageContent`, listen for the event and set local `searchQuery` and `sortOrder` to the default values.
- Document the action in the Command palette group in `src/data/keyboard-shortcuts.ts`.

## Consequences

- Users can restore Projects list sort and filter to defaults from ⌘K without opening the Projects page first; if the page is open, it updates immediately.
- Pattern matches "Restore run history filters" (preference lib + event + listener).
- One new ADR; no backend or new routes.
