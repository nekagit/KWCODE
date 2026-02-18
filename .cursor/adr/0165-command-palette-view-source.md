# ADR 0165: Command palette — "View source" action when app repository URL is set

## Status

Accepted.

## Context

The Configuration page has a "View source" button that opens the app repository in the default browser when `NEXT_PUBLIC_APP_REPOSITORY_URL` is set. Users who rely on the Command palette (⌘K) had no way to open the repository from there; they had to open Configuration first. Adding a "View source" action to the Command palette (shown only when the repo URL is set) provides the same capability from the palette and keeps behaviour consistent across entry points.

## Decision

- **CommandPalette.tsx**: When building `actionEntries`, if `getAppRepositoryUrl()` returns a non-null URL, add an entry "View source" (ExternalLink icon) that opens the URL in a new tab (`window.open(url, '_blank', 'noopener,noreferrer')`) and closes the palette. Reuse existing `getAppRepositoryUrl()` from `@/lib/app-repository`; no new Tauri commands or API routes.
- **keyboard-shortcuts.ts**: Add one row under the Command palette (⌘K) group: description "View source (opens app repository)" so the shortcuts help dialog documents the action.
- When the env var is unset or empty, the "View source" action is not shown in the palette.

## Consequences

- Users can open the app repository from the Command palette (⌘K) by selecting "View source" when the repository URL is configured, without opening the Configuration page.
- Behaviour is consistent with the Configuration "View source" button; both use the same URL and open in a new tab.
- The Keyboard shortcuts help (Shift+?) documents the action under the Command palette group.
