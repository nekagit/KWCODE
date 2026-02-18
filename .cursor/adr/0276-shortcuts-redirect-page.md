# ADR 0276 — Shortcuts redirect page /shortcuts

## Status

Accepted.

## Context

- Run, Testing, and Database have dedicated top-level routes (`/run`, `/testing`, `/database`) that redirect to the appropriate view or open a modal.
- The keyboard shortcuts help is only openable via Shift+?, the Dashboard/Configuration "Shortcuts" button, or the command palette "Keyboard shortcuts" action; there was no bookmarkable URL.
- Users could not share or bookmark a link that would open the shortcuts help directly.

## Decision

- Add a **Shortcuts redirect page** at **/shortcuts** that redirects to `/?openShortcuts=1` on mount (client-side), matching the pattern of `/database` → `/?tab=all`.
- In **QuickActionsProvider**, when the URL has `openShortcuts=1` (via a child that uses `useSearchParams`), open the shortcuts modal and clear the query param with `window.history.replaceState` so a refresh does not reopen the modal.
- Add `/shortcuts` to the page title map so the document title is "Shortcuts" during the redirect.
- No change to the command palette for this ADR; "Keyboard shortcuts" continues to open the modal directly.

## Consequences

- Users can bookmark or share `/shortcuts`; visiting it opens the Dashboard and the keyboard shortcuts modal.
- Consistent with other top-level redirect routes (/run, /testing, /database).
- Single new page and URL-handling in the existing provider; no new dependencies.
