# ADR 143: Dark theme sidebar vs content contrast (dark black vs grey-black)

## Status

Accepted.

## Context

In dark theme, the sidebar and main content area were too similar in tone (both near-black with translucent/glass effects), making it hard to distinguish navigation from content at a glance.

## Decision

- **Introduce a dedicated `--sidebar` CSS variable** so the sidebar can use a distinct surface color in every theme.
- **Dark theme (`.dark` and `[data-theme="dark"]`):**
  - **Sidebar (dark black):** `--sidebar: 240 14% 2%` — clearly darker, reads as “nav surface”.
  - **Content (grey-black):** `--background: 240 6% 11%` — lighter grey-black so the main area is clearly different from the sidebar.
  - **Cards:** `--card: 240 8% 8%` — solid, slightly darker than content for card surfaces.
- **App shell:** Sidebar `<aside>` uses `bg-sidebar` and a solid `border-border` instead of `glasgmorphism` and `bg-transparent` so the contrast is reliable. Main content uses `bg-background` explicitly.
- **Light and other themes:** `--sidebar` is set to a slightly different neutral (e.g. light grey) so the sidebar remains distinguishable where applicable.

## Consequences

- Sidebar and content are clearly distinguishable in dark theme (dark black vs grey-black).
- Single source of truth for sidebar color via `--sidebar`; Tailwind exposes it as `sidebar` for `bg-sidebar`.
- Glass effect removed from the sidebar in favour of solid colours for consistent contrast.
