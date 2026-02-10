# ADR 117: Suppress hydration warning on root &lt;html&gt; for data-theme

## Status

Accepted.

## Context

The app uses an inline script in the root layout that runs before paint and sets `document.documentElement.setAttribute("data-theme", t)` from `localStorage` so the first paint and loading overlay match the user’s stored theme (Configuration). The root layout is a Server Component and does not render `data-theme` on `<html>`.

- **Server**: Renders `<html lang="en" style="...">` with no `data-theme`.
- **Client**: After the script runs, `<html>` may have `data-theme="dark"` (or another value) before React hydrates.

React’s hydration then sees a mismatch between the server-rendered tree (no `data-theme`) and the client DOM (with `data-theme`), which triggers `emitPendingHydrationWarnings` and an unhandled hydration error in development.

## Decision

- Add `suppressHydrationWarning` to the root `<html>` element in `src/app/layout.tsx`.
- This is the standard way to acknowledge an intentional server/client difference on a single node (here, the theme attribute set by the blocking script).

## Consequences

- Hydration warnings for the root `<html>` element are suppressed; the warning stack (e.g. `createUnhandledError` / `handleClientError` / `emitPendingHydrationWarnings`) from this cause should stop.
- No change to behavior: theme still applies before paint; React still hydrates the rest of the tree normally.
- Only the `<html>` node is opted out of hydration mismatch checks; children (e.g. `RootLoadingOverlay`, which already uses `suppressHydrationWarning` where needed) are unchanged.
