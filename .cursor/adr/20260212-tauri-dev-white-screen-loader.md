# ADR: Tauri dev white screen – load local loader then redirect

## Date
2026-02-12

## Status
Accepted

## Context
On macOS, the Tauri dev window often showed a white screen: the WebView did not load `devUrl` (`http://127.0.0.1:4000/`) reliably. An existing workaround forced navigation from Rust at 1s, 3s, 5s, but the window could still stay white (e.g. if the WebView never loaded the initial URL or navigations were ignored).

## Decision
- **Two-step load in dev (debug build only):**
  1. **Loader first:** Write `public/tauri-load.html` to a temp file and navigate the WebView to it (file:// URL) after 150 ms. The loader shows the “kwcode” loading UI and redirects to `http://127.0.0.1:4000/` after 1.5 s.
  2. **Fallback retries:** At 2 s, 4 s, and 6 s from spawn, force-navigate to the app URL and run `window.location.href = appUrl` via `eval` so the user sees the Next.js app even if the loader redirect fails.
- **Implementation:** Use `include_str!("../../public/tauri-load.html")`, write to `std::env::temp_dir()/tauri-load.html`, build a `file://` URL via the `url` crate, and navigate to it in the existing setup workaround thread. Add `url = "2"` to `Cargo.toml`.
- **No change** to production builds or to `beforeDevCommand` / `wait-dev-server.mjs`.

## Consequences
- Users see the black “kwcode” loader instead of a white screen when the initial devUrl load fails; the loader then redirects to the dev server.
- If the loader or redirect fails, the 2 s / 4 s / 6 s retries still push the WebView to the app URL.
- Small extra dependency (`url` crate) and one temp file per run; loader content stays in sync with `public/tauri-load.html` via `include_str!`.
