# ADR 038: Configuration page CSS fix

## Status

Accepted.

## Context

When navigating to the Configuration page (`/configuration`), CSS could appear broken: styles (Tailwind/globals) not applied or layout wrong. This could happen when the document URL was `/configuration` (e.g. direct load or refresh), especially in the Tauri webview, where relative asset URLs might resolve against the current path instead of the origin.

## Decision

1. **Root layout (`src/app/layout.tsx`)**: In development only, add a `<base href="http://127.0.0.1:4000/" />` in `<head>`. This ensures any relative asset URLs resolve against the dev origin regardless of the current path (e.g. `/configuration`), so CSS and JS chunks load correctly when the initial or current URL is not `/`.

2. **Configuration route layout**: Add `src/app/configuration/layout.tsx` that wraps children in a simple container (`max-w-4xl w-full mx-auto`) so the Configuration page has consistent width and centering with other app pages and a clear layout boundary for the route.

## Consequences

- Dev builds get a base tag; production is unchanged.
- Configuration page has a dedicated layout segment, which can help Next.js include the route in the correct bundle and apply styles consistently.
- If CSS was still broken due to other issues (e.g. App Router CSS loading bugs), the layout at least keeps content readable and aligned.
