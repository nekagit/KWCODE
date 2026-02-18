# ADR 0168: Command palette — Discover folders action

## Status

Accepted.

## Context

The Discover Folders flow (discover folders from the app's configured root and add them as projects) was only openable from the Projects list page via the "Discover folders" button, or by following the Dashboard empty-state CTA that navigates to `/projects?discover=1`. Users on other pages (e.g. Prompts, Configuration, Documentation) had to navigate to Projects first and then click the button. There was no way to open the Discover Folders dialog from the Command palette (⌘K / Ctrl+K).

## Decision

- **CommandPalette.tsx**: Add a "Discover folders" action (FolderSearch icon) to the command palette. When selected, navigate to `/projects?discover=1` and close the palette. The Projects list page already opens the Discover Folders dialog when the `discover=1` query param is present (and then replaces the URL with `/projects`), so no new state or dialog wiring is required.
- **keyboard-shortcuts.ts**: Add one row under the Command palette group: "Discover folders (add folders as projects)" so the shortcuts help dialog documents the action.

## Consequences

- Users can open the Discover Folders flow from anywhere in the app via the Command palette (⌘K), by typing e.g. "discover" and selecting "Discover folders". The app navigates to the Projects page and the Discover Folders dialog opens automatically.
- No new backend, API, or clipboard behavior. The feature reuses the existing Projects list behavior and DiscoverFoldersDialog.
- The Keyboard shortcuts help (Shift+?) documents the new Command palette action.
