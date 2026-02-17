# ADR 0077: UI polish — globals, tabs, buttons, project list

## Status

Accepted

## Context

- The app uses Tailwind, Radix UI, and shared design tokens. A pass was requested to improve the UI without changing behavior or structure.

## Decision

- **globals.css**: Enable `scroll-behavior: smooth` on `html`; add a short `transition` on `body` for background/color so theme switches feel smoother.
- **app-shell**: Use `bg-background/95` on main content for slight contrast; loading spinner uses `border-t-primary` and muted track; sidebar resize handle uses a thinner default (`w-0.5`), `rounded-full`, and clearer hover/active states with `duration-150`.
- **tabs (ui/tabs.tsx)**: TabsList uses `rounded-xl`, `bg-muted/80`, `p-1.5`, `gap-0.5`. TabsTrigger gets `rounded-lg`, `duration-200`, active state with `shadow-sm` and `border border-border/60`, and `hover:text-foreground/90`. TabsContent gets `mt-5` and explicit `data-[state=inactive]:hidden`.
- **buttons (ui/button.tsx)**: Base `rounded-md` → `rounded-lg`; add `transition-all duration-200`, `active:scale-[0.98]`, and `focus-visible:ring-2 focus-visible:ring-offset-2` for consistency.
- **Projects list (tailwind-organisms.json)**: Tweak ProjectsListPageContent classes: section spacing `space-y-4`, heading `text-foreground/90`, list container `border-border/70`, `bg-card/90`, `p-4`; list items `rounded-xl`, `py-2.5 px-3.5`, `gap-3`, hover border `hover:border-border/50`; link `text-foreground` with hover `text-primary`; delete button `opacity-70` by default for calmer look.

## Consequences

- Smoother scrolling and theme transitions; clearer loading and resize affordances; tabs and buttons feel more consistent and responsive; project list has better hierarchy and hover feedback.
- No API or data changes; all edits are CSS and Tailwind class updates (including organism-classes JSON).

## References

- `src/app/globals.css` — scroll, body transition
- `src/components/app-shell.tsx` — main bg, spinner, resize handle
- `src/components/ui/tabs.tsx` — TabsList, TabsTrigger, TabsContent
- `src/components/ui/button.tsx` — buttonVariants
- `src/components/organisms/tailwind-organisms.json` — ProjectsListPageContent
