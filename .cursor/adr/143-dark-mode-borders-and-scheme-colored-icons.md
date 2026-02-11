# ADR 143: Dark mode borders and scheme-colored icons

## Status

Accepted.

## Context

Dark mode and theme-driven UI needed more visual differentiation: borders were neutral grey and icons did not reflect the theme palette (primary, info, success, etc.), making the interface feel flat and less tied to the chosen scheme.

## Decision

1. **Dark theme borders**
   - In dark theme (`.dark` and `[data-theme="dark"]`), change `--border` from neutral grey (`240 5% 12%`) to a blue-tinted grey (`217 14% 16%`) aligned with the primary blue accent.
   - Change `--input` to `217 12% 12%` for consistency.
   - Apply the same values in `src/data/ui-theme-templates.ts` for the dark template so Configuration-selected dark theme stays in sync.

2. **Semantic border usage**
   - Use primary-tinted borders for structure: sidebar section dividers and app-shell borders use `border-primary/30` or `border-primary/20` instead of `border-border/50`.
   - Add optional utility `.border-accent-subtle` in globals.css for dark mode (border uses `hsl(var(--primary) / 0.25)`).

3. **Icons and nav**
   - Active nav link: use `text-primary` and a left `border-l-2 border-primary` so the active item is clearly scheme-colored.
   - Optional per-item icon color: extend `NavItem` with `iconClassName` and pass it to `NavLinkItem` so Run uses `text-info/90`, Configuration uses `text-muted-foreground/90`, and Log (ScrollText) uses `text-info/80`.
   - Radix Tabs active trigger: use `data-[state=active]:text-primary` so project tab triggers use the scheme primary.

4. **Shared components**
   - `shared/Card.tsx`: switch from hardcoded `dark:bg-gray-800` / `dark:border-gray-700` to theme tokens `bg-card`, `border-border`, `text-card-foreground`, `text-muted-foreground`.
   - `shared/Tabs.tsx`: use `border-border` for the tab bar and `border-primary` / `text-primary` for the active tab, with `text-muted-foreground` and `hover:border-primary/30` for inactive.

## Consequences

- Dark mode feels more cohesive with the blue accent; borders and dividers carry a subtle primary tint.
- Navigation and tabs use the theme primary and info colors, improving wayfinding and consistency with the scheme.
- Shared Card and Tabs respect the current theme and work in all themes (light, dark, ocean, forest, warm, red).
- No new theme template keys were added; only existing `--border` and `--input` values were updated for dark, and components use existing Tailwind theme colors (e.g. `border-primary/30`, `text-info/90`).
