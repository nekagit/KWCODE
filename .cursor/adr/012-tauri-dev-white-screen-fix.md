# ADR 012: Tauri dev white screen fix

## Status

Accepted.

## Context

When running `tauri dev`, the webview sometimes showed a white screen instead of the Next.js app. Causes included:

1. **Timing**: The `beforeDevCommand` (wait-dev-server.mjs) exited as soon as the dev server returned 200. Next.js can return 200 before the app page has finished compiling, so the webview could load an incomplete response.
2. **Redirect**: The initial devUrl pointed to a static splash (`tauri-load.html`) that then redirected to `/`. The redirect or splash load could fail in the webview on some platforms.
3. **Fallback delay**: The Rust workaround that force-navigates to the app URL ran at 2s, 4s, 6s; if the first load failed, recovery was slow.

## Decision

- **Load the app root directly in dev**: Set `devUrl` to `http://127.0.0.1:4000/` so the webview loads the Next.js app immediately. No splash or client-side redirect. The layout already provides a loading overlay (#fafafa + spinner).
- **Wait for app readiness**: In `script/wait-dev-server.mjs`:
  - Poll the same URL as `devUrl` (the app root).
  - After the first 200, wait an extra **3 seconds** so Next.js has time to compile before Tauri opens the window.
- **Earlier Rust fallback**: Keep the force-navigate workaround for macOS/Tauri but run it at **1s, 3s, 5s** instead of 2s, 4s, 6s so recovery is faster if the initial load fails.

## Consequences

- Dev startup is a few seconds longer due to the 3s delay; white screen should be avoided.
- Single load to `/` avoids redirect and splash edge cases.
- If white screen still appears, user can run `npm run dev` in a separate terminal first, then `npm run tauri dev`.
