# ADR: Shared design CSS for src/components/shared

## Date
2026-02-11

## Status
Accepted

## Context
Shared UI components in `src/components/shared` needed a single, consistent design layer: smooth shadows, larger typography, and generalized styling applied across all components in that folder without duplicating styles in each file.

## Decision
- **Introduce `shared-design.css`** in `src/components/shared/` that:
  - Defines **design tokens** (CSS custom properties) for shadows, typography scale, radius, and transitions.
  - Uses **smooth, layered box-shadows** (multiple layers with low opacity) as a best practice for depth.
  - Uses **larger, readable typography** (font-size scale and line-height) for headings and body.
  - Scopes all visual rules to elements with **`data-shared-ui`** so only shared components are affected.
- **Import** `shared-design.css` from `src/app/globals.css` so it is applied globally once.
- **Mark every shared component** with `data-shared-ui` on its root element so the design applies consistently.
- Where appropriate, use utility classes **`.shared-card`**, **`.shared-shadow`**, **`.shared-shadow-md`**, **`.shared-shadow-lg`** for explicit shadow levels.

## Consequences
- One place to adjust shadows, font sizes, and radius for all shared components.
- New shared components should add `data-shared-ui` to their root to participate in the design system.
- Design tokens (e.g. `--shared-shadow`, `--shared-font-size-xl`) can be reused in Tailwind or other CSS.
