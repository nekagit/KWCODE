# ADR 106: UI theme unified schema and success/warning/info button colors

## Status

Accepted.

## Context

- UI themes (light, dark, ocean, forest, warm, red) are defined in `src/data/ui-theme-templates.ts` and applied via `[data-theme="…"]` in `globals.css`.
- Buttons had variants: default (primary), destructive, outline, secondary, ghost, link. There was no semantic variety for success, warning, or info actions.
- The theme variable set was documented in `.cursor/ui-theme-templates.md` but the schema was not explicitly unified between TypeScript, CSS, and documentation.

## Decision

- **Unified schema**
  - Every theme uses the same `UIThemeVariables` interface: all tokens (background, foreground, card, popover, primary, secondary, muted, accent, destructive, **success**, **warning**, **info** and their foregrounds, plus border, input, ring, radius).
  - Single source of truth: `UIThemeVariables` in `src/data/ui-theme-templates.ts` and the variable reference in `.cursor/ui-theme-templates.md` list the same set. Each theme template (light, dark, ocean, forest, warm, red) defines every token.
  - Document that the app applies one set per theme (no separate :root/.dark split per theme in code; `data-theme` overrides the full set).

- **New semantic colors**
  - Add CSS variables: `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--info`, `--info-foreground` in `:root`, `.dark`, and each `[data-theme="…"]` in `globals.css`.
  - Extend Tailwind theme in `tailwind.config.ts` so `bg-success`, `text-success-foreground`, etc. are available.
  - Per-theme values: success (green ~142°), warning (amber ~38°), info (blue ~217°), with foregrounds for contrast; tuned per theme (e.g. ocean uses primary-aligned info, forest uses primary-aligned success).

- **New button variants**
  - Add to `src/components/ui/button.tsx`: `success`, `warning`, `info` (same pattern as destructive: bg + text-foreground, hover opacity).
  - Use for confirm/success, caution/review, and neutral info actions. Existing `destructive` remains for danger/delete.

- **Documentation**
  - Update `.cursor/ui-theme-templates.md`: unified schema note, variable table extended with success/warning/info, and a "Button variants" subsection listing default, destructive, success, warning, info, outline, secondary, ghost, link plus text color classes.

## Consequences

- Buttons and text can use distinct semantic colors (success, warning, info) that respect the selected theme.
- All themes share one schema; adding a new theme requires defining all tokens including success/warning/info.
- New components (e.g. Alert, Badge) can use `variant="success"` / `variant="warning"` / `variant="info"` if we add those variants later; for now only Button has them.
