# ADR: Design system single source of truth (design.md)

## Date
2026-02-13

## Status
Accepted

## Context
The project uses Tailwind, shadcn/ui, CSS variables for theming, and multiple theme variants (light, dark, ocean, forest, warm, red). Design decisions were spread across `globals.css`, `tailwind.config.ts`, `shared-design.css`, and component files. There was no single reference for tokens, typography, spacing, component patterns, accessibility, or anti-patterns, which risked inconsistency and duplicated decisions when adding or changing UI.

## Decision
- Introduce **`.cursor/setup/design.md`** as the **single source of truth** for all visual, interaction, and brand decisions.
- The document includes:
  - **Current state assessment** (framework, UI library, color system, component structure, domain, gaps).
  - **Design philosophy** (principles, values, accessibility commitment).
  - **Color system** (semantic tokens, theme variants, data-viz palette, contrast rules, usage rules).
  - **Typography** (font stacks, type scale, heading hierarchy, text colors, rules).
  - **Spacing & layout** (scale, grid, component spacing, z-index, breakpoints, sidebar spec).
  - **Component design patterns** (buttons, inputs, cards, badges, dialogs, tabs, tables, Kanban, toasts, dropdowns, accordion, tooltips) with variants, states, and accessibility notes.
  - **Iconography** (Lucide, sizes, stroke, usage, naming).
  - **Motion & animation** (easing, duration, patterns, reduced motion).
  - **Dark mode & theme strategy** (architecture, adjustments, testing checklist, anti-patterns).
  - **Accessibility guidelines** (WCAG 2.1 AA, focus, semantics, ARIA, keyboard).
  - **Design anti-patterns** (15 items with bad/good examples).
  - **Appendix** (quick reference for tokens, type, spacing).
- New or changed UI should align with `design.md`; tokens and patterns in code should stay consistent with it. The doc is updated when the design system evolves.

## Consequences
- One place to look for design rules, tokens, and patterns; faster onboarding and fewer ad-hoc decisions.
- Clear baseline for consistency (colors, type, spacing, components) and for accessibility and theme behavior.
- Design.md is maintained as a living document; future ADRs can reference it when changing visual or interaction standards.
