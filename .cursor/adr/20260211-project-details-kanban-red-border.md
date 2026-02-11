# ADR 20260211: Red border around kanban board on project details

## Status
Accepted

## Context
On the project details page (Todo tab), the kanban board (columns grid) needed a clear visual boundary so users can quickly identify the board area.

## Decision
Wrap the kanban columns grid in a container with a red border:

- In `ProjectTicketsTab.tsx`, wrap the existing `grid` div (that renders `ProjectTicketsKanbanColumn` for each column) in a wrapper `div` with:
  - `rounded-lg border-2 border-red-500 p-4`
- The grid layout and column components are unchanged; only the outer container was added.

## Consequences
- The kanban board is visually delineated by a red border and padding on the project details Todo tab.
- If the border should later match theme (e.g. use a semantic or theme token), the class can be updated to something like `border-destructive` or a CSS variable.
