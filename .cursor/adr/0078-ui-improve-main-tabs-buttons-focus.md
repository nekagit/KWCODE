# ADR 0078: UI improve — main content area, tabs, buttons focus

## Status

Accepted

## Context

- Follow-up UI pass: improve readability and visual hierarchy of the main content area, tabs, and button focus states without changing behavior.

## Decision

- **globals.css**: Set `line-height: 1.6` on `body` for readability. Add `.main-content-area` with a subtle vertical gradient (background to slightly transparent) for light and dark themes to give the main pane subtle depth.
- **app-shell**: Apply `main-content-area` to `<main>` and keep the existing inset border; remove fixed `bg-background/98` so the gradient from globals applies.
- **tabs (ui/tabs.tsx)**: TabsList: `bg-muted/70`, add `border border-border/30`. TabsTrigger: add `data-[state=active]:font-semibold` and `hover:data-[state=inactive]:bg-muted/50` for clearer active state and inactive hover.
- **buttons (ui/button.tsx)**: Add `focus-visible:ring-offset-background` so focus rings have consistent offset against the background.

## Consequences

- Main content has subtle depth; body text is easier to read; tabs have clearer active/inactive distinction and hover feedback; keyboard focus on buttons is more visible. No API or structure changes.
- References: `src/app/globals.css`, `src/components/app-shell.tsx`, `src/components/ui/tabs.tsx`, `src/components/ui/button.tsx`.
