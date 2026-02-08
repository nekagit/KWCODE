# ADR 081: UI theme templates for colors, accents, and background

## Status

Accepted.

## Context

Users need a single place to change the app’s colors, accents, and background. The app uses CSS variables (HSL) in `src/app/globals.css` and Tailwind theme in `tailwind.config.ts`; critical inline CSS in `layout.tsx` and `root-loading-overlay.tsx` provide first-paint fallbacks. Without a reference, it was unclear which variables to edit and how to keep themes consistent.

## Decision

- **Documentation**
  - Add `.cursor/ui-theme-templates.md` as the canonical reference for UI theming.
  - Document every CSS variable (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, radius), what they control, and which Tailwind classes use them.
  - List the three edit points: `globals.css`, `layout.tsx` (critical CSS + html/body/#root-loading), and `root-loading-overlay.tsx` (inline fallback).

- **Templates**
  - Provide copy-paste theme blocks for:
    - Light default (current neutral theme)
    - Dark default
    - Ocean (blue accent, light/dark)
    - Forest (green accent, light/dark)
    - Warm (amber accent, cream/dark)
    - Red background (strong)
  - Each template includes full `:root` and `.dark` variable sets and suggested fallback hex values for layout and loading overlay.
  - Include a short HSL reference for custom values.

- **No code change**
  - No new theme files or build steps; templates are documentation only. Users paste into existing `globals.css` and optionally sync layout/loading fallbacks.

## Consequences

- Users can change all colors, accents, and background from one reference doc and keep layout/loading in sync.
- New themes can be added to the doc without touching app code.
- Single source of truth for variable names and edit locations.
