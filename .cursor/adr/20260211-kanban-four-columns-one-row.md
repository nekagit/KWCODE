# ADR: Kanban board — 4 columns in one row

## Date
2026-02-11

## Status
Accepted

## Context
The Kanban board columns were stacking vertically (below each other) instead of appearing in one row of 4 columns side by side.

## Decision
- **Wrapper (`ProjectTicketsTab` classes[51]):** Change from `flex-col` to **`flex-row overflow-x-auto`** so the Kanban grid is laid out in a horizontal flex container and scrolls horizontally when needed.
- **Grid (classes[52]):** Use **`grid grid-cols-4 gap-4 min-h-full min-w-max w-full flex-shrink-0`** so the grid always has 4 columns in one row, does not shrink, and has a minimum width from content (`min-w-max`); narrow viewports get horizontal scroll.
- **Column card (`KanbanColumnCard` classes[0]):** Add **`min-w-[220px]`** so each column has a minimum width and the grid’s `min-w-max` keeps all 4 in one row.

## Consequences
- Kanban board displays as 4 columns in a single row.
- On narrow viewports the board scrolls horizontally instead of stacking.
