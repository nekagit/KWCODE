# ADR: Central Tailwind classes in shared-classes.json

## Date
2026-02-11

## Status
Accepted

## Context
Tailwind class strings were scattered across `src/components/shared` components, making it hard to adjust styling in one place and keep visual consistency.

## Decision
- **Add `shared-classes.json`** in `src/components/shared/` containing all Tailwind class strings, grouped by component and element (e.g. `Card.root`, `Card.title`, `Dialog.panel`, `Tabs.tabButtonActive`).
- **Add `shared-classes.ts`** that re-exports the JSON for typed imports (`import sharedClasses from './shared-classes'` or `@/components/shared/shared-classes`).
- **Update every shared component** to use `sharedClasses.ComponentName.key` instead of inline class strings. Where `className` is combined with props (e.g. `className` prop or alignment), use `cn(sharedClasses.X.y, className)` or template literals for dynamic variants.

## Consequences
- **Single source of truth**: Edit `shared-classes.json` to change shadows, spacing, typography, or variants for all shared components.
- New shared components should add their class keys to the JSON and import from `shared-classes`.
- Dynamic variants (e.g. Tabs active/inactive, ButtonGroup alignment) are stored as separate keys and combined in code.
