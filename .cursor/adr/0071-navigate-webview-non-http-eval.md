# ADR 0071: Navigate WebView — use eval for non-http(s) URLs to avoid parse error

## Status

Accepted.

## Context

In the desktop (Tauri) build, users saw **"The string did not match the expected pattern"** when using the Worker, Planner, or Control tabs (e.g. when clicking "All projects" or when navigation used app-internal URLs). The message comes from the Rust `url` crate’s `ParseError` when a URL is parsed and does not match the expected pattern (e.g. custom schemes like `asset://`). The `navigate_webview_to` command had been updated to fall back to `window.location.href = url` via `eval` when `url.parse::<Url>()` failed, but:

1. Some environments might accept custom schemes for parsing while `WebView::navigate()` still fails or surfaces the error.
2. Using `w.navigate()` with non-http(s) URLs can trigger parse errors that are shown to the user.

So the error could still appear when the passed URL was app-internal (e.g. `origin + '/projects'` or `origin + '/projects?open=id'` with `origin` like `asset://...`).

## Decision

In `navigate_webview_to` (Rust):

- **Always** use the **eval path** only: set `window.location.href` via `w.eval()` with the URL string (JSON-escaped). Do **not** parse the URL in Rust and do **not** call `w.navigate()` from this command.
- **Frontend**: For opening a project and going back to the list, **do not call** `navigate_webview_to` in Tauri. Use client-side navigation only: `router.push('/projects?open=' + id)` and `router.replace('/projects')`. This avoids passing any URL to the native layer, so the “The string did not match the expected pattern” error (which can be triggered by the WebView/asset protocol when a URL is set) never occurs.

This guarantees we never call `w.navigate()` with `asset://` or other custom schemes, so the user never sees the URL parse error on Worker, Planner, or Control (or when going back to the list).

## Consequences

- "The string did not match the expected pattern" no longer appears when using Worker, Planner, or Control or when navigating back to the projects list in the desktop app.
- App-internal navigation (e.g. `/projects`, `/projects?open=id`) is always done via eval; only explicit http(s) URLs use `w.navigate()`.
- Aligns with Tauri/WebView behavior where `navigate()` can panic or surface errors for non-http(s) URLs.

## References

- `src-tauri/src/lib.rs` — `navigate_webview_to` command
- ADR 0067 — Desktop project link client-side navigation
- `url` crate `ParseError`; Tauri `Webview::navigate()`
