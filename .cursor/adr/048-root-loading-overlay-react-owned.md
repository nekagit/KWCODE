# ADR 048: Root loading overlay – React-owned visibility

## Status

Accepted.

## Context

The app showed a full-screen loading overlay with spinner that was supposed to hide after the client mounted or after a 2s timeout. Users reported the screen staying white with the spinner indefinitely.

- The overlay was server-rendered in the layout; an inline script and `ClearLoadingOverlay` (useEffect) set `data-loaded="true"` on the overlay div to hide it.
- After React hydrated, it could reconcile the DOM and **reset** the overlay div to match the server output (which had no `data-loaded`), making the overlay visible again.
- In some environments (e.g. Tauri webview) the inline script might run at a different time or the overlay might never receive the attribute reliably.

## Decision

1. **Client component that owns visibility**  
   Introduce `RootLoadingOverlay`: a client component that **renders** the overlay div and controls visibility with React state (`loaded`). It sets `data-loaded={loaded ? "true" : undefined}` so React owns the attribute; after `useEffect` runs on mount it sets `loaded` to `true`, and the overlay hides. No DOM mutation is overwritten by hydration.

2. **Layout uses only the component**  
   In the root layout, replace the static overlay div, the inline `Script` (2s/3s timeout and Continue button), and the `ClearLoadingOverlay` usage with a single `<RootLoadingOverlay />`. The critical CSS (variables, `#root-loading` styles, `root-load-spin` keyframes) remains in the layout `<head>` for first paint.

3. **No inline hide script**  
   Remove the inline script that hid the overlay after 2s and added a "Continue" button after 3s. Hiding is handled entirely by the client component. If the app never loads (e.g. JS error), the user can refresh.

## Consequences

- The overlay reliably disappears once the client has mounted; hydration no longer brings it back.
- Simpler layout: one component instead of overlay + script + ClearLoadingOverlay.
- `clear-loading-overlay.tsx` is no longer used in the layout; the file remains for reference or future use.
