# ADR 0164: Configuration page — Open repository / View source link

## Status

Accepted.

## Context

The Configuration page shows app version, theme, data directory, and export actions but had no way to open the app’s source code or repository. Users who want to report issues, read the changelog, or contribute had to find the repo URL elsewhere. Adding an optional "View source" button that opens the repository in the default browser improves discoverability and is a common pattern in desktop and web apps.

## Decision

- **New lib** `src/lib/app-repository.ts`: Export `getAppRepositoryUrl(): string | null`. Returns `process.env.NEXT_PUBLIC_APP_REPOSITORY_URL` (trimmed) when set, otherwise null. Next.js inlines `NEXT_PUBLIC_*` at build time so the value is available on the client.
- **Configuration page**: In the Version section, when `getAppRepositoryUrl()` is non-null, show a "View source" button (ExternalLink icon) that opens the URL in a new tab with `window.open(url, '_blank', 'noopener,noreferrer')`. When the env var is not set, the button is not rendered.
- No new preferences or persistence; the URL is configured at build time via environment.

## Consequences

- Users can open the app repository from Configuration when `NEXT_PUBLIC_APP_REPOSITORY_URL` is set (e.g. in `.env.local` or deployment config).
- Single new module and one component touch; no store or API changes.
- To enable the button, set `NEXT_PUBLIC_APP_REPOSITORY_URL=https://github.com/org/repo` (or equivalent) before building or in runtime env where supported.
