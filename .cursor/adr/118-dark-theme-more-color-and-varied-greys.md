# ADR 118: Dark theme — more color and varied greys

## Status

Accepted.

## Context

- The app offers a "Dark" UI theme (Configuration page) with variables defined in `src/data/ui-theme-templates.ts` and mirrored in `src/app/globals.css` for `[data-theme="dark"]` and `.dark`.
- The previous dark theme used a single neutral grey family (240 hue, similar lightness) for background, card, secondary, muted, accent, border, and input, and used pure white for primary. This made the theme feel flat and lacking visual depth and accent color.

## Decision

- **More color in dark theme**
  - **Primary**: Changed from white (`0 0% 98%`) to a soft blue (`217 91% 65%`) so primary buttons and links have a clear accent. Primary foreground set to dark (`240 12% 4%`) for contrast.
  - **Ring**: Aligned with primary (`217 91% 65%`) for focus states.
  - **Accent**: Given a blue-grey tint (`217 28% 18%`) so hover/active states have subtle color.
  - **Foreground**: Slight blue tint (`220 8% 96%`) for consistency with the blue accent.
  - **Success / info**: Kept vivid; **warning** foreground set to dark for contrast on amber.
  - **Destructive**: Slightly adjusted (`0 55% 42%`) for dark background.

- **Different greys for depth**
  - **Background**: `240 12% 4%` (cool dark base).
  - **Card**: `235 14% 6%` (cooler, slightly lighter than background).
  - **Popover**: `235 14% 7%` (one step lighter than card).
  - **Secondary**: `240 5% 16%` (neutral grey, distinct from card).
  - **Muted**: `230 6% 20%` (slightly warmer grey for variety).
  - **Border**: `240 5% 12%` (darker than secondary for clear edges).
  - **Input**: `240 5% 10%` (darker than border so inputs read as recessed).

- **Sync**
  - Dark theme variables updated in `ui-theme-templates.ts` (single source for ThemeStyleInjector).
  - `globals.css` updated for both `[data-theme="dark"]` and `.dark` so first-paint and class-based dark mode match.

## Consequences

- Dark theme has a clear blue accent and more visual depth via varied greys.
- Primary actions are clearly colored; focus and hover states feel cohesive.
- All three dark definitions (template, data-theme, .dark) stay in sync to avoid flash or inconsistency.
