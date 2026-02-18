# ADR 0252: Command palette — Copy current page URL

## Status

Accepted.

## Context

The app has many copy actions in the command palette (⌘K): app info, run history, ideas, folder paths, documentation info, etc. There was no way to copy the **current page URL** (path, query string, and hash) to the clipboard. Users who want to share a deep link (e.g. to a project tab or a specific documentation section) or paste the URL elsewhere had to copy it manually from the address bar.

## Decision

- Add a **"Copy current page URL"** action to the command palette (⌘K) that copies the full current page URL (origin + pathname + search + hash) to the clipboard, with success/error toast feedback.
- **New lib** `src/lib/copy-current-page-url.ts`: Export `getCurrentPageUrl()` and `copyCurrentPageUrlToClipboard()`. Use `window.location` in browser; SSR-safe (no-op when `window` is undefined). Use existing `copyTextToClipboard` for clipboard and toasts.
- **CommandPalette.tsx:** Import the lib; add handler that calls `copyCurrentPageUrlToClipboard()` and closes the palette. Add one action entry "Copy current page URL" with Link icon.
- **keyboard-shortcuts.ts:** Add "Copy current page URL" in the Command palette group only.

## Consequences

- Users can copy the current page URL from the command palette (⌘K) for sharing or pasting elsewhere.
- The action is documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
