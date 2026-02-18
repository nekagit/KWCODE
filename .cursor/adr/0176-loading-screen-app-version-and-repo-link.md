# ADR 0176: Loading screen — show app version and repository link

## Status

Accepted.

## Context

The Loading screen page (`/loading-screen`) displays the same moon-and-stars visual as the root loading overlay, with a breadcrumb and back link. It did not show app version or a way to open the app repository. Users who land on this page (e.g. via direct link or from the sidebar) had no at-a-glance identity or "View source" entry point. The Configuration page already shows version and a repository link; the Loading screen is a natural place to offer the same context without navigating away.

## Decision

- **LoadingScreenPageContent.tsx**: Add a footer area at the bottom of the page that displays:
  1. **App version** — Fetched via `getAppVersion()` in a `useEffect`; show "—" until loaded, then "v{version}" in muted white (e.g. `text-white/60`). Reuse `getAppVersion` from `@/lib/app-version`.
  2. **View source link** — If `getAppRepositoryUrl()` returns a URL (from `NEXT_PUBLIC_APP_REPOSITORY_URL`), render a "View source" link that opens the URL in a new tab (`target="_blank" rel="noopener noreferrer"`). Use `getAppRepositoryUrl` from `@/lib/app-repository`. Style to match the dark loading aesthetic (muted white, hover slightly brighter).
- Footer is centered and uses flex-wrap so it works on narrow viewports. No new Tauri commands or API routes; no new lib files.

## Consequences

- Users on the Loading screen can see the app version and open the repository in one click, consistent with Configuration.
- Footer is unobtrusive (small, muted) so the loading visual remains the focus.
- If the repo URL is not set, only the version is shown; if version fails to load, "—" is shown.
