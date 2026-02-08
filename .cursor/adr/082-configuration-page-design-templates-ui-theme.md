# ADR 082: Configuration page – design templates for UI theme

## Status

Accepted.

## Context

Users wanted to change the app’s colors, accents, and background from within the app. A reference doc (`.cursor/ui-theme-templates.md`) already listed theme templates and manual edit points; the Configuration page only had Scripts and Timing. Adding design templates to Configuration allows in-app theme switching without editing CSS or layout files.

## Decision

- **Theme data and application**
  - Add `src/data/ui-theme-templates.ts` with theme definitions (id, name, description, CSS variable sets) for: Light default, Dark, Ocean, Forest, Warm, Red. Export `applyUITheme(id)`, `getStoredUITheme()`, `isValidUIThemeId()`, and `UI_THEME_TEMPLATES`.
  - Persist selected theme in `localStorage` under key `app-ui-theme`. Apply by setting `data-theme` on `document.documentElement`; CSS in `globals.css` defines `[data-theme="light"]`, `[data-theme="dark"]`, etc., with the same variable overrides as in the doc.

- **First-paint and loading overlay**
  - In `layout.tsx`, add an inline script in `<head>` that runs before paint: read `localStorage.getItem("app-ui-theme")` and, if valid, set `document.documentElement.setAttribute("data-theme", value)`. Critical CSS already uses `hsl(var(--background))` and `hsl(var(--foreground))` for `html`, `body`, and `#root-loading`; spinner uses `var(--border)` and `var(--foreground)`. So the loading overlay and first paint follow the stored theme once `globals.css` (with `[data-theme]` blocks) has loaded.
  - Remove hardcoded hex fallbacks from `root-loading-overlay.tsx` and use `hsl(var(--background))` / `hsl(var(--foreground))` so the overlay respects the active theme.

- **Configuration page**
  - Add a “Design templates” card at the top of the Configuration page. Card lists all themes in a responsive grid; each item shows a small swatch (background + primary color), theme name, and description. Selecting a theme calls `applyUITheme(id)` and updates local state so the current selection is highlighted (ring + border). Choice is persisted in `localStorage` and applied immediately across the app.

- **CSS**
  - Keep `:root` and `.dark` in `globals.css` as defaults. Add one `[data-theme="..."]` block per theme with the full set of `--background`, `--foreground`, `--card`, `--primary`, `--accent`, etc., so overriding the theme does not require changing `:root` at runtime.

## Consequences

- Users can change the UI theme (background, accents, component colors) from Configuration without editing code. Selection is remembered across sessions.
- Theme list and values stay in sync with `.cursor/ui-theme-templates.md` (doc remains the reference for manual edits or new themes).
- Adding a new theme requires: (1) adding the template to `ui-theme-templates.ts`, (2) adding a `[data-theme="id"]` block in `globals.css`, and (3) including the id in the layout script’s allowed list.
