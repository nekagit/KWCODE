# ADR: Todo tab four sections in vertical stack with Features at bottom

## Date
2026-02-11

## Status
Accepted

## Context
The project details Todo tab (in `ProjectTicketsTab`) displayed four sections in a horizontal grid: FEATURES, TERMINALS, KANBAN, TICKETS. Users requested these sections to be stacked vertically (below each other) and Features to be placed at the bottom of the tickets—i.e. at the end of the stack.

## Decision
- Change the layout from a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4` or `lg:grid-cols-3` when not Tauri) to a single-column flex stack: `flex flex-col gap-4`.
- Order of sections top to bottom:
  1. **Terminals** – Implement All terminal slots (Tauri only; at top)
  2. **Kanban** – Backlog / In progress / Done columns
  3. **Features** – In progress / Done feature list
  4. **Tickets** – In progress / Done ticket list (at bottom)
- Remove grid-specific classes (`flex-1`, `max-h-[75vh]`, `min-w-[200px]`, etc.) from section cards where they were used for column balancing; use `min-w-0` and `flex-col` for consistent vertical stacking.

## Consequences
- All four sections are always visible in one column; users scroll down to see Kanban, Terminals, and Features.
- Features appear after Tickets, Kanban, and Terminals as requested.
- Layout is simpler and works better on narrow viewports; no horizontal squashing of multiple columns.
