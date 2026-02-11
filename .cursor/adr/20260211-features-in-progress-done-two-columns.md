# ADR: Features section — In progress and Done side by side

## Date
2026-02-11

## Status
Accepted

## Context
In the Tickets tab (project details), the FEATURES block showed "In progress" and "Done" stacked vertically. The layout used `grid grid-cols-1 gap-4 sm:grid-cols-2`, so on small viewports the two groups appeared in one column; on `sm` and up they were two columns. Users wanted the two groups to always appear next to each other: one column for In progress, one for Done.

## Decision
- In `tailwind-molecules.json` for `TabAndContentSections/ProjectTicketsTab.tsx`, the Features (and Tickets) two-column container uses **`grid w-full grid-cols-2 grid-rows-1 gap-4`**.
- `grid-rows-1` forces a single row so "In progress" and "Done" always sit side by side in one row with two columns.
- In progress and Done are always shown as two adjacent columns regardless of viewport.

## Consequences
- Clearer at-a-glance comparison of in-progress vs done features.
- On very narrow viewports the columns may be tighter; acceptable for this screen’s use case.
