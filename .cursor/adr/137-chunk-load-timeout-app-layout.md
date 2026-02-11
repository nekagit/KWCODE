# ADR 137: Fix "Loading chunk app/layout failed (timeout)" in Tauri dev

## Status

Accepted

## Context

When running `npm run tauri dev`, the Tauri webview sometimes showed:

```
SOMETHING WENT WRONG
LOADING CHUNK APP/LAYOUT FAILED. (TIMEOUT: HTTP://127.0.0.1:4000/_NEXT/STATIC/CHUNKS/APP/LAYOUT.JS)
```

- Next.js (webpack) loads the root HTML, then the client requests JS chunks (e.g. `app/layout.js`). Webpack’s JSONP chunk loader has a **chunk load timeout** (default 120s); if the request takes longer, it throws `ChunkLoadError` with type "timeout".
- In Tauri dev, the webview can be slower to complete chunk requests, or the app/layout chunk may still be compiling when the page first loads. That can cause the client-side timeout before the chunk is ready.
- Related: [Next.js issue #66526](https://github.com/vercel/next.js/issues/66526) (ChunkLoadError: Loading chunk app/layout failed).

## Decision

1. **Increase webpack chunk load timeout (client only)**  
   In `next.config.mjs`, in the `webpack` callback, when `!isServer`, set:
   - `config.output.chunkLoadTimeout = 180000` (3 minutes).
   This gives the Tauri webview more time to load the app/layout chunk before webpack aborts with a timeout.

2. **Warm app/layout chunk before Tauri opens**  
   In `script/wait-dev-server.mjs`, after the existing “chunks OK” check:
   - Parse the root HTML for script `src` attributes that look like the app/layout chunk (e.g. URL containing `app/layout` or `app\\layout`).
   - If found, perform a GET request to that URL so Next.js compiles the app/layout chunk before the Tauri window loads the page.
   - Log “Warming app/layout chunk” / “App/layout chunk warmed”; if the URL is not found or the request fails, log and continue (non-fatal).

## Consequences

- Fewer “Loading chunk app/layout failed (timeout)” errors in Tauri dev; the client has 3 minutes to load the chunk and the layout chunk is often already compiled when the window opens.
- No change for non-Tauri dev (browser); timeout is only increased for client builds.
- wait-dev-server may take a bit longer when it warms the app/layout chunk; failure to warm is non-blocking.

## References

- `next.config.mjs` (webpack `output.chunkLoadTimeout`)
- `script/wait-dev-server.mjs` (`warmAppLayoutChunk`, `findAppLayoutChunkUrl`)
- ADR 129 (Tauri dev – wait for chunks before opening window)
- ADR 132 (Improve Next.js dev server readiness check for Tauri)
- [Next.js #66526](https://github.com/vercel/next.js/issues/66526) – ChunkLoadError app/layout timeout
