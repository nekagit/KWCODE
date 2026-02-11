# ADR 147: Design templates – better padding

## Status
Accepted

## Context
On the Configuration page, the Design Templates section shows theme preview cards in a grid. User feedback requested better padding to improve readability and visual breathing room for the theme name, CARD/ICONS/BUTTONS sections, and the description within each card, as well as spacing between cards.

## Decision
Increase padding and spacing consistently across the Design Templates UI:

1. **ThemePreviewCard**
   - Wrap the theme name in a padded container: `px-4 pt-4 pb-2` so the title has clear spacing from the card edges.
   - Content area: change from `p-2 space-y-2` to `px-4 pb-4 space-y-3` for horizontal alignment with the header and more vertical space between CARD, ICONS, and BUTTONS sections.
   - Description block: change from `px-3 py-2` to `px-4 py-3` for consistency and readability.

2. **ThemeSelector (both locations)**
   - Grid gap: change from `gap-4` to `gap-5` for more space between theme cards.

3. **Theme preview atoms**
   - **ThemeColorSwatches**: container `p-2` → `p-3`; Badge `mb-1.5` → `mb-2`; swatches `gap-1` → `gap-1.5`.
   - **ThemeIconPreview**: container `gap-1.5` → `gap-2`; icons row `gap-1` → `gap-2`.
   - **ThemeButtonPreview**: section `space-y-1` → `space-y-2`; buttons row `gap-1` → `gap-2`.

## Consequences
- Design Templates cards have clearer internal hierarchy and more comfortable spacing.
- Grid and card content remain aligned; no layout or theme behaviour changes.
