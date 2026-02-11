# ADR: Project details tab row – flex layout for consistent spacing

## Date
2026-02-11

## Status
Accepted

## Context
The project detail page tab row (Git & Testing, Todo, Setup) used a 3-column grid (`grid-cols-3`) so each tab had equal width. The shorter "Todo" tab looked overly wide with empty space, and the active state made the row feel uneven (“weird spacing”).

## Decision
- Change the tab list layout from **grid** to **flex** in `tailwind-organisms.json` for `ProjectDetailsPageContent.tsx` (TabsList class `c["6"]`).
- Use `flex flex-wrap items-center justify-center gap-2` so each tab is only as wide as its content (icon + label) and spacing between tabs is consistent.

## Consequences
- Tabs are content-sized; no extra empty width on short labels.
- Same gap between all tabs; active tab no longer appears to “expand” the row.
- Tab row remains centered and wraps on small viewports via `flex-wrap`.

## Follow-up (alignment)
- Tab triggers: added `justify-center` and `shrink-0` so icon + label stay centered and don’t shrink; icons use `shrink-0` for consistent size.
- Tab content panels: added `mx-auto w-full max-w-2xl` to all TabsContent (git, todo, setup) so the content area matches the tab bar width and is centered, aligning the content with the tab row.
