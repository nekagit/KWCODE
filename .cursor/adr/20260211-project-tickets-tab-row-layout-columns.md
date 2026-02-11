# ADR: ProjectTicketsTab single-row multi-column layout

## Date
2026-02-11

## Status
Accepted

## Context
The ProjectTicketsTab (Kanban tab on project details) previously rendered Features, Terminals, Kanban board, and Tickets in a **vertical stack**—one section below the other. This led to:
- Poor use of horizontal space and long vertical scrolling
- Unclear visual separation between Features, Terminals, Kanban, and Tickets
- Tight spacing and inconsistent padding/margins
- In some views, terminal blocks and ticket/feature cards appearing intertwined

User feedback and screenshots confirmed the need for a layout where **Features, Terminals, Kanban, and Tickets sit in rows in different columns next to each other**, with improved padding and margins and a clearer UI.

## Decision
- **Layout:** Restructure the main content into a **single responsive grid row** with up to **four columns** side by side:
  1. **Features** — In progress / Done feature list (or “No features yet” when empty)
  2. **Terminals** — Terminal 1, 2, 3 (Tauri only); log output only, no ticket/feature cards inside
  3. **Kanban** — Backlog + In Progress + Done (or equivalent) as the Kanban board
  4. **Tickets** — In progress / Done ticket lists (or empty state)
- **Full width:** Keep ProjectCategoryHeader (e.g. “Kanban”), feature–ticket warning, and the toolbar (Add ticket, Add feature, Implement All, etc.) full width above the grid. Keep GenerateKanbanPromptSection full width below the grid.
- **Responsive:** Use `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`; when not Tauri (no Terminals column), use `xl:grid-cols-3` so the row has three columns.
- **Column panels:** Each column is wrapped in a card-like panel (border, background, padding, `overflow-auto`, `min-h-[280px]`) for clear separation and scrollable content.
- **Styling:** Extend `tailwind-molecules.json` for ProjectTicketsTab with missing class indices (39, 40, 51, 52, 57, 59–63) and new layout classes (root padding, main grid, column panel). Add list spacing (`space-y-2`) for feature/ticket lists.

## Consequences
- Features, Terminals, Kanban, and Tickets are clearly separated and visible in one row on large screens.
- Better use of horizontal space; less vertical stacking and scrolling.
- Consistent padding/margins and panel styling improve readability and UI clarity.
- Terminals column shows only terminal output; ticket/feature cards are confined to their respective columns.
- Small screens stack columns (1 or 2 columns); large screens show 3 or 4 columns.
