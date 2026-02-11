# ADR 146: Accordion, Dialog, Table use theme tokens (grey in dark mode)

## Status
Accepted

## Context
The app uses `data-theme` on `<html>` for theming; Tailwind's `dark:` variant is class-based and is not triggered. Several shared components used hardcoded `bg-white dark:bg-gray-800` (and similar), so in dark theme they stayed white:

- **Accordion**: Used for "Add ticket" (Tickets tab) and "Add feature" (Feature tab). The accordion container and item styles used `bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`, etc., so the Add ticket and Add feature form cards appeared white in dark mode.
- **Dialog**: Modal content used `bg-white dark:bg-gray-800` and gray borders.
- **Table**: Table body and borders used hardcoded light/dark grays.

## Decision
Switch Accordion, Dialog, and Table to theme design tokens so they follow the active theme (grey in dark, light in light):

1. **Accordion**
   - Container: `bg-card text-card-foreground border border-border` instead of `bg-white dark:bg-gray-800`.
   - Item border: `border-border` instead of `border-gray-200 dark:border-gray-700`.
   - Trigger: `text-foreground hover:bg-muted/50` instead of gray/dark utilities.
   - Content: `text-muted-foreground` instead of `text-gray-700 dark:text-gray-300`.

2. **Dialog**
   - Content panel: `bg-card text-card-foreground border-border` instead of white/dark gray.
   - Header and footer borders, close button: `border-border`, `text-muted-foreground hover:text-foreground`.

3. **Table**
   - Table borders: `divide-border` instead of gray divide colors.
   - Header: `text-muted-foreground`.
   - Body: `bg-card`, cell text: `text-card-foreground`.

## Consequences
- "Add ticket" and "Add feature" accordion cards render with grey backgrounds in dark theme.
- Dialogs and tables follow the same theme; no more white panels in dark mode.
- All these components now rely on CSS variables set by `data-theme` and stay consistent with Card and EmptyState.
