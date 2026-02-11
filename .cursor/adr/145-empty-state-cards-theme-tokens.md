# ADR 145: Empty state cards use theme tokens (grey in dark mode)

## Status
Accepted

## Context
On the project details page, the "No tickets yet" and "No features yet" cards (rendered by `EmptyState`) appeared with a **white** or light grey background in dark theme. The app uses `data-theme` on `<html>` for theming and injects CSS variables (e.g. `--card`, `--card-foreground`). `EmptyState` used Tailwind utility classes `bg-gray-50 dark:bg-gray-700/20`; Tailwind's `dark:` variant is class-based and was not triggered by `data-theme="dark"`, so the cards stayed light.

## Decision
Use the same design tokens as the rest of the app so empty states follow the active theme:

1. **EmptyState and LoadingState**  
   Replace hardcoded `bg-gray-50 dark:bg-gray-700/20` and `text-gray-500 dark:text-gray-400` with:
   - `bg-card text-card-foreground` for the container (grey in dark theme, white/light in light theme).
   - `border border-border` for consistency with `Card`.
   - Icons: `text-muted-foreground`; description already uses `text-muted-foreground`.

2. **No Tailwind dark: usage**  
   Rely on CSS variables set by `data-theme` so behaviour is correct for all theme IDs (dark, ocean, forest, etc.) without duplicating dark logic.

## Consequences
- "No tickets yet" and "No features yet" (and any other `EmptyState` / `LoadingState` usage) show grey card backgrounds in dark theme and light card backgrounds in light theme.
- Empty states are visually consistent with the shared `Card` component and the rest of the UI.
