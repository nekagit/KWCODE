# ADR 142: Configuration theme cards contrast when app is dark

## Status
Accepted

## Context
On the Configuration page, theme preview cards show each theme’s colors. When the app theme is **dark**, light-themed preview cards (Light, Ocean, Forest, Warm, Red) kept pure white backgrounds and the card title used `dark:text-gray-200`, so both title and content appeared light on light, with poor contrast.

## Decision
1. **Title inherits card foreground**  
   `ThemeNameHeader` no longer uses `text-gray-800 dark:text-gray-200`. It uses `text-inherit` so the title uses the card’s foreground color (dark on light previews, light on dark previews).

2. **Dimmer white + dark text when app is dark and preview is light**  
   When the app theme is dark and the preview theme’s card is light (card lightness ≥ 90%):
   - Use a dimmer white for the card and content area: `hsl(0 0% 96%)` instead of pure white.
   - Use dark text: `hsl(240 10% 3.9%)` for foreground and appropriate muted values for labels/descriptions.
   - Apply these overrides in `ThemePreviewCard` and pass optional overrides to `ThemeColorSwatches` and `ThemeIconPreview` so badges and icons use dark text on the dimmer white.

3. **HSL parsing**  
   A small helper parses the theme’s `card` HSL string to get lightness so we can detect “whitish” cards (lightness ≥ 90).

## Consequences
- Theme cards on the Configuration page stay readable in dark mode: light previews use dimmer white and black/dark text.
- Title and content no longer conflict; both follow the same contrast rules.
- Theme preview atoms accept optional override props only when needed; existing behavior is unchanged when overrides are not passed.
