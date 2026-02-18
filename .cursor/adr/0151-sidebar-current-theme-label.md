# ADR 0151: Sidebar — current theme label in footer

## Status

Accepted.

## Context

Users can change the app theme from the Configuration page or via the Command palette (Switch to light/dark mode), but the app shell did not show which theme is currently active. To see the current theme, users had to open Configuration or remember their last choice. A small at-a-glance indicator in the sidebar would improve discoverability and confidence.

## Decision

- Add a **SidebarThemeLabel** component that displays the current theme’s display name (e.g. "Light default", "Dark", "Ocean") in the sidebar footer.
- Place it in the same footer block as the app version and sidebar toggle, above the version, so the order is: theme label → version → collapse toggle.
- Use existing `useUITheme()` and `getUIThemeById()` from `@/data/ui-theme-templates` to resolve the theme id to the template name; no new theme data or persistence.
- When the sidebar is collapsed, hide the label (same behavior as SidebarVersion) to avoid clutter.
- Style: small muted text (`text-[10px] text-muted-foreground`), with an `aria-label` for accessibility.

## Consequences

- Users can see the current theme at a glance from the sidebar footer without opening Configuration.
- New shared component `src/components/shared/SidebarThemeLabel.tsx`; `app-shell.tsx` is the only integration point.
- Future theme ids added to `UI_THEME_TEMPLATES` will automatically appear in the label via the existing template name.
