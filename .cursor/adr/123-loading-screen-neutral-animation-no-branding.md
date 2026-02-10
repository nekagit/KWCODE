# ADR 123: Loading screen – neutral animation, no branding

## Status

Accepted.

## Context

The app showed the same initial loading screen on every load: KWCode wordmark with shimmer, progress bar, and bouncing dots (ADR 121). The user wanted a different loading experience: a different animation when the app is loading, and not to see "KWCode" during that phase.

## Decision

- **Remove branding from loading screens**: No KWCode (or any product name) on the Tauri load page or the React root loading overlay.
- **Use a single, neutral loading animation**:
  - **Spinner**: A rotating ring (circle with transparent segment / accent border) to indicate progress.
  - **Pulsing dots**: Three small dots below the spinner with a staggered pulse (opacity + scale) for a distinct, non-branded feel.
- **Applied in**:
  - `src/components/root-loading-overlay.tsx` – React overlay shows only spinner + pulsing dots; no text.
  - `src/app/layout.tsx` – Critical CSS keyframes renamed to `root-loading-spin` and `root-loading-pulse` (replacing `kwcode-shimmer`, `kwcode-progress`, `kwcode-bounce`).
  - `public/tauri-load.html` – Title set to "Loading"; body shows only spinner + pulsing dots; KWCode brand div removed.

## Consequences

- Loading is clearly distinguished from the main app; users do not see the product name until the shell is visible.
- Same minimal animation is used for both the Tauri load page and the React overlay for consistency.
- ADR 121 remains in place for app metadata and shell branding (title, sidebar "KWCode"); only the loading screens are de-branded.
