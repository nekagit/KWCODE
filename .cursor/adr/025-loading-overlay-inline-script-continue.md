# ADR 025: Loading overlay inline script and Continue button

## Status

Accepted.

## Context

In Tauri dev, the "Loading Run Prompts Control…" overlay could stay visible indefinitely. The overlay was cleared by: (1) a Next.js `Script` with `strategy="beforeInteractive"` after 2s, and (2) `ClearLoadingOverlay` when React hydrated. In the Tauri webview, the Next.js script could run late or not at all, and hydration could be delayed or fail, leaving the user stuck on the loading screen.

## Decision

- **Inline script in layout**: Replace the Next.js `Script` with a plain inline `<script>` in the root layout HTML. The script runs as soon as the parser reaches it and does not depend on Next.js or React. It:
  - Hides the overlay after **3 seconds** by setting `data-loaded="true"` on `#root-loading`.
  - After **4 seconds**, if the overlay is still visible, injects a **"Continue"** button; clicking it hides the overlay. The button is only added once (guarded by class `js-continue-btn`).
- **Keep ClearLoadingOverlay**: The client component still clears the overlay on mount and after a 5s fallback for when React hydrates normally.

## Consequences

- The loading overlay will disappear after at most 3s from first paint, or the user can click "Continue" after 4s if something blocks the script.
- No dependency on Next.js Script or React for the fallback path; works in any environment (Tauri webview, slow networks, JS errors).
- Slightly longer minimum display (3s vs 2s) for the loading state to reduce chance of a flash before content is ready.

## Follow-up (same ADR): App never leaves loading in Tauri dev

### Context

Even after the overlay logic, the app could still show only a spinner: `AppShell` waited for `isTauriEnv === true` before rendering. In the Tauri webview loading a remote URL, `window.__TAURI__` can be injected late, so `isTauriEnv` stayed `null` and the shell never rendered.

### Decision

- **Run-state**: If `isTauriEnv` is still `null` after **2 seconds**, set it to `false` so the app proceeds in browser mode and never blocks indefinitely.
- **AppShell**: Remove the "wait for `isTauriEnv !== null`" full-screen spinner. Treat `null` as non-Tauri for display (`isTauri = isTauriEnv === true`) so the UI always renders; only show the data-loading spinner when `loading && isTauri`.

### Consequences

- The app shows content within a few seconds in Tauri dev even if the Tauri API is slow to appear; Tauri-specific features may activate later when the API is available.
