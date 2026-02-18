# ADR 0286: Loading screen — Copy app version to clipboard

## Status

Accepted.

## Context

The Loading screen page (`/loading-screen`) displays the app version in the footer (e.g. "v0.1.0") but there was no way to copy it. Users reporting bugs or documenting their environment had to retype the version from the screen.

## Decision

Add a **Copy version** control to the Loading screen footer:

- In `LoadingScreenPageContent.tsx`, next to the version text, add a small button with the Copy icon that copies the version string (e.g. "v0.1.0") to the clipboard via `copyTextToClipboard` from `@/lib/copy-to-clipboard`, with success/error toast.
- Show the button only when version is loaded and not the fallback "—".
- Style the button to fit the dark footer (ghost/outline, low emphasis) so it does not overpower the loading screen.

## Consequences

- Users can copy the app version from the Loading screen in one click for bug reports or documentation.
- Single file change; reuses existing `copyTextToClipboard` and toast behavior.
- No new libs; no command palette entry (action is page-specific).
