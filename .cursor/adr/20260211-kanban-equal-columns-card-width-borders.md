# ADR: Kanban equal column width, same card size, consistent borders

## Date
2026-02-11

## Status
Accepted

## Context
The Kanban board had columns and cards of inconsistent width (e.g. BACKLOG column and cards wider than DONE), and column styling varied. Users requested same-width columns, same-sized cards, and a consistent, clear border.

## Decision
- **Columns grid (`ProjectTicketsTab` classes[52]):** Use **`grid grid-cols-4 gap-4 w-full min-w-0 flex-1 min-h-0`** so all four columns (Backlog, In progress, Done, Testing) get equal width via CSS Grid fractional space. Wrapper (classes[51]) set to **`flex flex-col`** so the grid expands in the flex layout.
- **Column card (`KanbanColumnCard` classes[0]):** Use **`w-full min-w-0`** instead of fixed `w-[280px] min-w-[220px]` so each column fills its grid cell. Apply **`rounded-xl border-2 border-border bg-card shadow-sm`** for a consistent, visible border and card look across all columns.
- **Column card inner (classes[2]):** Use **`items-stretch gap-2 w-full min-w-0`** so ticket cards stretch to the same width within the column.
- **Ticket card (`KanbanTicketCard` classes[13]):** Use **`w-full min-w-0`** instead of **`w-fit min-w-[200px] max-w-[240px]`** so every card has the same width as its column (and thus the same width across columns). Add **`rounded-lg`** for consistency.

## Consequences
- All Kanban columns have equal width.
- All ticket cards have the same width within and across columns.
- Column and card borders are consistent and readable (border-2, rounded corners, theme border color).
- Layout is predictable and works with 4-column grid when all columns are present.
