# ADR 0014: Tauri dev loading fix and wait-dev-server resilience

## Status

Accepted

## Context

Running `npm run tauri dev` could leave the user stuck on a loading screen because:

1. **beforeDevCommand** runs `wait-dev-server.mjs`, which starts (or reuses) the Next.js dev server and waits for the root URL and for app chunks to be served. If the chunk check timed out (e.g. first Next compile slow or fetch timeout), the script exited with code 1. Tauri then aborted or opened the window with the dev server not fully ready.
2. The Tauri window loads `http://127.0.0.1:4000/`. If the dev server was not ready or chunk requests failed, the WebView showed a loading state and React never hydrated, so the root loading overlay never received the client-side `setLoaded(true)` and stayed visible indefinitely.

## Decision

- **Wait script:** Do not fail the whole dev flow when the chunk check times out. Log a warning and exit with code 0 so Tauri still opens. Rely on the user running `npm run dev` first when needed (documented in the warning and in setup).
- **Fetch timeout:** Increase `fetchTimeoutMs` in `wait-dev-server.mjs` from 30s to 45s to give the first Next compile more time.
- **Loading overlay fallback:** In the root layout, add an inline script that after 15 seconds sets `data-loaded="true"` on `#root-loading` if it is not already set (i.e. React did not hydrate). This way, if chunk loading fails, the overlay still fades out and the user can see the page or refresh after starting the dev server.

## Consequences

- `tauri dev` no longer aborts when the chunk check times out; the window opens and the app may load once the dev server is ready.
- Recommended workflow: run `npm run dev` in one terminal, wait for "Ready", then run `npm run tauri dev` in another so the Next server is up before the Tauri window loads.
- If the app never hydrates (e.g. 404s for chunks), the loading overlay disappears after 15s so the user is not stuck and can refresh or fix the dev server.

## References

- `script/wait-dev-server.mjs` — beforeDevCommand script
- `src/app/layout.tsx` — root loading overlay and fallback script
- `src-tauri/tauri.conf.json` — devUrl, beforeDevCommand
