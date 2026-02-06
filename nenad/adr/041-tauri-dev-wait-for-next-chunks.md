# ADR 041: Tauri dev – wait for Next.js chunks before opening

## Status

Accepted.

## Context

In Tauri dev, the webview loads from `http://127.0.0.1:4000/`. The `beforeDevCommand` runs `script/wait-dev-server.mjs`, which starts the Next dev server (if needed) and waits until the root URL returns 200, then waits a fixed 3s delay. The window could open before Next had finished compiling JS chunks (`main-app.js`, `app-pages-internals.js`), causing 404s and a stuck loading experience (e.g. Projects page never rendering).

## Decision

1. **Chunk readiness check**  
   After the root returns 200 and the existing fixed delay, fetch the root HTML, parse it for the first `<script src="…_next/static…">` URL, and poll that URL until it returns 200 (with a timeout). Only then exit so Tauri opens the window. This ensures at least one app chunk is being served before the webview loads.

2. **Fallback**  
   If no such script is found in the HTML or the chunk never returns 200 within the timeout, log a warning and still exit 0 so Tauri opens (avoid blocking indefinitely). Recommend running `npm run dev` first then `tauri dev` if 404s persist.

3. **Constants**  
   Use a 60s max wait for the chunk and 800ms between polls; keep the initial 3s delay after the root 200.

## Consequences

- Tauri dev is less likely to open with 404s for `_next/static` chunks; the Projects page and other client-rendered content can load.
- Cold start may take a bit longer while we wait for the first chunk.
- If Next changes chunk URL shape or dev behavior, the script still exits after the fixed delay and warns instead of hanging.
