# ADR 0052: Tauri build — static export so built app finds index.html

## Status

Accepted.

## Context

After building the Tauri app and running the built .app, the window showed "asset not found: index.html". Tauri embeds the frontend from `frontendDist` (../out) at build time. The `out` directory was empty because the Next.js build was not configured to produce a static export when building for Tauri, and the project uses both next.config.js and next.config.mjs without `output: "export"` in the config that Next actually loads.

## Decision

1. **Enable static export only for Tauri build**  
   In `next.config.js`, when `TAURI_BUILD=1`, set `output: "export"` and `images: { unoptimized: true }` so the Next build writes to `out/` with `index.html` and static assets.

2. **Tauri beforeBuildCommand**  
   Use a dedicated script `script/build-for-tauri.mjs` instead of `TAURI_BUILD=1 npm run build`. The script temporarily moves `src/app/api/data/route.ts` aside, runs `TAURI_BUILD=1 npm run build`, then restores it. This avoids ENOTDIR: the top-level `/api/data` route would otherwise export to a **file** `out/api/data`, while nested routes need `out/api/data/` as a **directory**; moving the parent route aside lets Next create the directory.

3. **API routes and dynamic segments**  
   For `output: "export"`, every route (including API route handlers) must be statically exportable. We added `export const dynamic = "force-static"` and, where needed, `generateStaticParams()` to all API routes. For handlers that use `request.url`, we return a stub when `process.env.TAURI_BUILD === "1"` so they don’t trigger dynamic bailout during export.

4. **Page dynamic route**  
   `app/projects/[id]/page.tsx` now exports `generateStaticParams()` returning `[{ id: "new" }]` so the segment is included in the static export.

## Consequences

- The Tauri build produces a populated `out/` with `index.html`; the bundled app loads the frontend correctly.
- Normal `npm run build` (without TAURI_BUILD) is unchanged and does not use static export.
- API routes are still used in browser/dev; in the Tauri build they are only used to generate static responses for the export.

## References

- `next.config.js` — TAURI_BUILD conditional export
- `script/build-for-tauri.mjs` — move api/data/route aside, build, restore
- `src-tauri/tauri.conf.json` — beforeBuildCommand: node script/build-for-tauri.mjs
- API route handlers under `src/app/api/` — dynamic = "force-static", generateStaticParams, TAURI_BUILD stub where needed
