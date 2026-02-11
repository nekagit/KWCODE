# ADR: Project detail — Tickets section In progress / Done in one row, two columns

## Date
2026-02-11

## Status
Accepted

## Context
On the project detail page (Todo tab), the TICKETS section showed "IN PROGRESS" and "DONE" in a single column with two rows (stacked vertically). Users requested that these appear next to each other in one row with two columns.

## Decision
- In `ProjectTicketsTab.tsx`, the container for the two status groups (In progress | Done) now uses an **explicit** class: **`grid w-full grid-cols-2 gap-4`** instead of relying on a tailwind-molecules class index that was not producing a two-column layout.
- Applied to both:
  - **Features** block (In progress / Done features)
  - **Tickets** block (In progress / Done tickets)
- Column wrappers use **classes[34]** (`space-y-2 min-w-0`) for consistent spacing and min-width within each column.

## Consequences
- IN PROGRESS and DONE always appear side by side (one row, two columns) for both Features and Tickets.
- Layout is stable regardless of tailwind-molecules array ordering.
- Aligns with existing ADR 20260211-features-in-progress-done-two-columns intent.
