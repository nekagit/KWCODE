# ADR 115: Design template selection – theme context and sync so selection applies

## Status

Accepted.

## Context

- On the Configuration page, selecting a design template (UI theme) was supposed to apply the theme via `applyUITheme(id)` (localStorage + `data-theme` on `document.documentElement`). Users reported that nothing changed when selecting a template.
- The root layout renders `<html>` in React. When the Configuration page updated local state and called `applyUITheme`, the attribute could be applied then overwritten by React reconciliation (layout output does not include `data-theme`), so the visual theme did not persist.

## Decision

- **UI theme context**
  - Add `src/context/ui-theme.tsx`: `UIThemeProvider` holds current theme (initial from `getStoredUITheme()` in a mount effect) and exposes `theme` and `setTheme(id)`.
  - A `ThemeSync` component inside the provider runs a `useEffect` that calls `applyUITheme(theme)` whenever `theme` changes, and re-applies once on the next animation frame so the attribute persists after React’s commit.

- **Layout and Configuration**
  - Wrap app content in `UIThemeProvider` in `layout.tsx` (inside body, around existing providers).
  - Configuration page uses `useUITheme()` instead of local state and direct `applyUITheme`. On template click it calls `setTheme(id)`; the context updates and `ThemeSync` applies the theme to the document.

## Consequences

- Selecting a design template on Configuration immediately updates the app’s colors and the selection ring; the theme persists for the session and across reloads (localStorage + head script unchanged).
- Single source of truth for the current theme in React; no risk of the document attribute being stripped by reconciliation without a follow-up apply.
