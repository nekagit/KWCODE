# ADR: Kanban board — Backlog, In progress, Done in 3 columns, 1 row

## Date
2026-02-11

## Status
Accepted

## Context
On the project details page (Todo tab), the Kanban board should display exactly three columns in a single row: **Backlog**, **In progress**, and **Done**. The previous layout used a responsive grid (1 / 2 / 4 columns) and rendered all column keys from the data model (including "testing"), which did not match the desired simple 3-column board.

## Decision
1. **Kanban columns grid (ProjectTicketsTab, classes[52]):**
   - Use a fixed 3-column, 1-row layout: `grid min-h-0 w-full grid-cols-3 gap-4` (replacing `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
   - Ensures the board is always Backlog | In progress | Done in one row across breakpoints.

2. **Column order and visibility:**
   - Render only the three columns **backlog**, **in_progress**, **done** in that order.
   - Do not render the "testing" column on the project-details Kanban board.
   - Implementation: map over `["backlog", "in_progress", "done"]` and render `KanbanColumnCard` for each; guard with `if (!column) return null` for safety.

## Consequences
- Kanban board on project details shows a single row of three columns: Backlog, In progress, Done.
- Layout is consistent and predictable; no responsive column count change.
- Data model in `todos-kanban` still defines four columns (backlog, in_progress, done, testing); only the UI chooses to show three for this view.
