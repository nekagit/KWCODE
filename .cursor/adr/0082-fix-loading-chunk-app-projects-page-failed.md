# ADR 0082: Fix "Loading chunk app/projects/page failed" in Tauri dev

## Status

Accepted.

## Context

When running the app via Tauri dev (`npm run dev:tauri`), navigating to the projects list could show **"Something went wrong"** with:

`Loading chunk app/projects/page failed. (missing: http://127.0.0.1:4000/_next/static/chunks/app/projects/page.js)`

The dev server compiles route chunks on demand. The wait script (`script/wait-dev-server.mjs`) already warms the **app/layout** chunk so the initial load does not hit a missing or slow chunk. The **app/projects/page** chunk was not warmed, so the first request for `/projects` (e.g. from a link or direct load) could request a chunk that was not yet compiled, leading to a missing chunk error in the Tauri webview.

## Decision

- In **script/wait-dev-server.mjs**, after warming the app/layout chunk, add a **warm request for the projects page**: `GET /projects` with the same timeout as the layout warm. This triggers Next.js to compile the `app/projects/page` route and its chunk before the Tauri window opens, so when the user navigates to `/projects` the chunk is already available.
- Implement this as a new helper `warmProjectsPageChunk()` that fetches the projects URL (using the same `baseUrl` and `fetchTimeoutMs` as the rest of the script) and log success/skip for consistency with the existing layout warm.

## Consequences

- "Loading chunk app/projects/page failed" should no longer occur when opening the app via Tauri dev and navigating to the projects list, because the chunk is compiled during the wait phase.
- If the error persists (e.g. stale `.next` cache), clearing `.next` and re-running `npm run dev` then `npm run dev:tauri` remains a valid workaround.

## References

- `script/wait-dev-server.mjs` — `warmAppLayoutChunk`, `warmProjectsPageChunk`, and their invocation
- next.config.mjs — `chunkLoadTimeout`, `assetPrefix` for Tauri dev
