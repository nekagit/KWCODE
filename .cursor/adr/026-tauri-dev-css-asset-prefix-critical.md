# ADR 026: Tauri dev – CSS fix (assetPrefix + critical inline)

## Status

Accepted.

## Context

In Tauri dev, the app window sometimes showed broken or missing CSS when loading the Next.js app from `http://127.0.0.1:4000/`. The webview could fail to load stylesheets when they were referenced with relative URLs, or the main CSS could load after the first paint.

## Decision

- **next.config.mjs**: In development, set `assetPrefix` to `http://127.0.0.1:4000` so Next emits absolute URLs for CSS and JS (e.g. `http://127.0.0.1:4000/_next/static/...`). This makes the webview resolve asset URLs correctly regardless of base URL.
- **layout.tsx**: Add critical inline CSS in the root layout `<head>`: CSS variables (`:root`), simple reset, and base `html`/`body` styles matching `globals.css`. The app gets correct background, foreground, and border colors even if the main Tailwind stylesheet is delayed or fails to load in the webview.

## Consequences

- Dev builds use absolute asset URLs; production (static export) keeps `assetPrefix` undefined.
- Slight duplication of variables and base styles in the layout; acceptable for Tauri dev reliability.
- If the main stylesheet still fails, layout and typography remain readable; component-level Tailwind classes may still depend on the main CSS loading.

## Follow-up: Static export only in production

With `output: "export"` always on, the dev server failed: API routes (e.g. `/api/data/ideas`) require dynamic mode and are incompatible with static export. Next showed a 500: "export const dynamic / revalidate not configured on route \"/api/data/ideas\" with \"output: export\"".

**Decision**: Set `output: "export"` only when `NODE_ENV === "production"` (i.e. during `next build`). In development (`next dev`), do not use static export so API routes and full Next behavior work. Tauri dev loads from the dev server; Tauri production uses the built `out/` from `next build`.
