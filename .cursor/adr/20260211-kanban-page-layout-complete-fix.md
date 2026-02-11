# ADR: Kanban page — complete layout fix (overlap, spacing, missing classes)

## Date
2026-02-11

## Status
Accepted

## Context
The Kanban tab (project details, Todo tab) had a broken layout:
- Terminal cards (TERMINAL 1, 2, 3) overlapped the header toolbar (Add ticket, Add feature, Open in system terminal, etc.).
- Features and Tickets section wrappers had no styling (missing class indices).
- Terminals grid wrapper and tickets list wrapper had no classes (indices 61–63 were beyond the extracted array), causing layout and flow issues.
- Toolbar and content lacked clear separation, and Kanban section needed consistent spacing.

## Decision
1. **Missing class indices (tailwind-molecules.json — ProjectTicketsTab):**
   - **classes[61]:** Section wrapper for “Features” and “Tickets” blocks: `mt-6 space-y-4` so sections have top margin and internal spacing.
   - **classes[62]:** Inner wrapper for the tickets list: `space-y-2` for vertical spacing between items.
   - **classes[63]:** Wrapper for ImplementAllTerminalsGrid: `mt-4 w-full min-h-0` so the terminals block stays in document flow, has top margin, full width, and does not force flex growth.

2. **Toolbar (classes[9]):**
   - Add `w-full` and `shrink-0` so the toolbar row always takes full width and does not shrink, keeping it on its own row and preventing inline overlap with the terminals grid.

3. **Kanban section (classes[51], [52]):**
   - **classes[51]:** Add `mt-4` and `shrink-0` so the Kanban block has top margin and does not shrink in the flex column.
   - **classes[52]:** Simplify to `grid min-h-0 w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4` (remove `h-full flex-1`) so the grid does not over-claim height and layout stays predictable.

## Consequences
- Toolbar, terminals grid, and Kanban columns sit in clear vertical blocks with no overlap.
- Features and Tickets sections have proper section spacing and list spacing.
- Terminals grid is always below the toolbar with consistent margin.
- Kanban columns keep responsive columns (1 / 2 / 4) without layout bleed.
