# ADR 0066: Design system document — setup/design.md

## Status
Accepted (2025-02-17)

## Context
The project uses Tailwind, shadcn/ui, CSS variables (HSL), and multiple themes (light, dark, ocean, forest, warm, red) but had no single source of truth for visual, interaction, and brand decisions. Design decisions were scattered across components and globals.css, and onboarding or consistency checks required codebase archaeology.

## Decision
- Create a comprehensive, production-ready design system document at **`.cursor/1. project/design.md`**.
- The document serves as the single source of truth for:
  - Design philosophy and principles (clarity, progressive disclosure, semantic color, accessibility, theme coherence, reduced motion).
  - Color system: semantic tokens (light/dark and theme variants), data-viz palette, contrast requirements, usage rules.
  - Typography: font stacks, type scale, heading hierarchy, text color hierarchy, rules (line length, code).
  - Spacing and layout: 4px-based scale, grid, component spacing (cards, forms, sections, sidebar), z-index, breakpoints, sidebar spec.
  - Component design patterns: Buttons, Inputs, Cards, Badges, Dialogs, Tabs, Tables, Kanban, Toasts, Dropdowns/Select, Accordion, Tooltips/Popovers (with Tailwind/shadcn references).
  - Iconography: Lucide React, size scale, stroke, usage and naming.
  - Motion and animation: easing, duration, patterns (button, card, dialog, accordion), when to animate, reduced motion.
  - Dark mode and theme strategy: architecture (class + data-theme), dark adjustments, testing checklist, anti-patterns.
  - Accessibility: WCAG 2.1 AA, focus, semantic HTML, ARIA, keyboard.
  - Design anti-patterns: 15 items with BAD/GOOD examples (radius, shadows, typography, labels, colors, disabled, spacing, focus, status, animation, grid, reinventing components, loading, mobile).
- Include a **Current State Assessment** at the top summarizing framework, UI library, color system, component structure, domain (KWCode as developer workflow/prompts app), and gaps (e.g. card padding consistency, typography scale documentation).
- Include an **Appendix** with quick-reference tables for color tokens, type scale, and spacing.

## Consequences
- New and existing contributors (and AI agents) can align on one document for all design decisions.
- Consistency checks and code reviews can reference `.cursor/1. project/design.md` instead of inferring from code.
- Future theme or component changes should update this document; the doc is explicitly marked as a living document.
- ADRs that affect visual or interaction design can reference this document.
