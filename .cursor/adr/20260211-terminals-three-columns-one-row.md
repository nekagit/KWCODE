# ADR: Terminals section — 3 columns in 1 row

## Date
2026-02-11

## Status
Accepted

## Context
In project detail (Todo tab), the Terminals block (Implement All terminals 1–3) is rendered by `ImplementAllTerminalsGrid`. The grid previously used `grid-cols-1 gap-4 sm:grid-cols-3`, so on small viewports the three terminal slots stacked vertically; only from `sm` upward did they appear as three columns. User request: terminals should be **3 columns in 1 row** for consistent layout.

## Decision
- **ImplementAllTerminalsGrid** layout is updated to always show three columns in one row.
- In `tailwind-molecules.json` for `ProjectTicketsTab.tsx`, the grid class for the terminals container (index 0) is changed from:
  - `"grid w-full grid-cols-1 gap-4 sm:grid-cols-3"`
  to:
  - `"grid w-full grid-cols-3 gap-4"`.
- No change to the number of slots (still 3) or to the parent row that contains Features, Terminals, Kanban, and Tickets.

## Consequences
- The three terminal slots always render in one row as three columns, regardless of viewport width.
- On very narrow screens, columns may become narrow; content remains readable via existing ScrollArea and min heights.
- Aligns with the project-detail layout goal of clear, row-based sections (see 20260211-project-tickets-tab-row-layout-columns.md).
