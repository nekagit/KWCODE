# ADR 127: Initial loading – kwcode branded (rain) and page fade-in/out

## Status

Accepted.

## Context

Users wanted a distinctive first-load experience and smooth transitions:

- **Initial app load**: Show “kwcode” on a black background with rain-like circles falling (fine, small drops). Grass and fire were removed in a later update; only raindrops remain.
- **Between pages**: Normal loading (e.g. spinner) but content should always use fade-in and fade-out for transitions.

ADR 123 had removed branding from loading screens; this ADR reintroduces branding for the initial load only, with the new creative direction.

## Decision

### Initial loading (root overlay)

- **Background**: Black (`#000`) for both the React root loading overlay and the Tauri load HTML so the first paint and transition are consistent.
- **Branding**: “kwcode” wordmark centered, white, prominent.
- **Animations** (CSS-only, in `src/components/root-loading-overlay.tsx` and `src/app/globals.css`):
  - **Rain**: Many fine circles (e.g. 64, size ~2–8px) falling from top to bottom; position, duration, and delay are deterministic from index to avoid hydration mismatch. Grass and fire layers were removed; only raindrops are shown.
- **Exit**: Overlay fades out (e.g. 0.5s ease-out) when the app has mounted; critical CSS in layout keeps `#root-loading` background black and transition smooth.

### Tauri load page

- **`public/tauri-load.html`**: Black background, “kwcode” text, and the same three pulsing dots (no rain/grass/fire, to keep the static HTML simple). This aligns the Tauri → webview handoff with the React overlay (same brand and black).

### Page-to-page transitions

- **Normal, colorless loading**: No animations between pages. Main content renders without fade-in; the Suspense fallback is a plain neutral gray spinner (border only, no accent color), no fade-in.
- **Animated loading only on initial load**: The kwcode + raindrops overlay is the only animated loading; it is shown once when the app boots and then fades out.

## Consequences

- Initial load is strongly branded and visually distinctive (fine raindrops on black).
- Tauri and React loading share black + “kwcode” for a consistent first impression.
- Only the initial root overlay is animated and fades out; between-page loading is neutral and non-animated.
- Rain parameters are deterministic (seed from index) to avoid React hydration mismatches.
