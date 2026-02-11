# ADR 144: Dark configuration theme cards use grey instead of white

## Status
Accepted

## Context
ADR 142 introduced a “dimmer white” (`hsl(0 0% 96%)`) for theme preview cards when the app is dark and the preview theme is light, to improve contrast. User feedback: in dark configuration, cards should not be white at all—they should be grey to match the dark UI.

## Decision
When the app theme is **dark** and the preview theme’s card is light (card lightness ≥ 90%), theme preview cards now use **grey** surfaces instead of dimmer white:

1. **Card and content background**  
   Use dark grey: `hsl(240 8% 14%)` (`DARK_CARD_GREY`) instead of `hsl(0 0% 96%)`.

2. **Card and content foreground**  
   Use light text: `hsl(220 8% 96%)` (`DARK_CARD_FG`) for readability on the grey background.

3. **Muted areas**  
   Muted background: `hsl(230 6% 20%)`, muted foreground: `hsl(235 8% 58%)`, aligned with the dark theme’s muted palette.

4. **Implementation**  
   In `ThemePreviewCard`, replace constants `DIMMER_WHITE` / `DARK_TEXT` with `DARK_CARD_GREY` / `DARK_CARD_FG` and apply them to the card container, content area, and overrides passed to `ThemeColorSwatches` and `ThemeIconPreview`.

## Consequences
- On the Configuration page in dark mode, all theme preview cards (including light-themed ones) use grey backgrounds; no white cards.
- Visual consistency with the dark configuration layout; cards read as “dark UI surfaces” rather than light inserts.
- Contrast is preserved via light text on grey.
