# ADR: Kanban page heading and Tickets card below board

## Date
2026-02-11

## Status
Accepted

## Context
The project details tab that shows the Kanban board and features was titled "Tickets", which was ambiguous. Users wanted the main heading to reflect the Kanban view, and a dedicated "Tickets" summary card (like the Features card) below the board for a quick list of tickets by status.

## Decision
- **Heading:** Change the page title from "Tickets" to **"Kanban"** in `ProjectTicketsTab` (`ProjectCategoryHeader`).
- **Tickets card:** Add a "Tickets" card below the Kanban board, mirroring the Features card:
  - Same layout: two columns side-by-side ("In progress" | "Done").
  - Each item shows ticket number, title, and optional feature name; feature color from `getFeatureColorClasses` for consistency with Features and Kanban cards.
  - Reuses existing molecule classes (61, 33, 35, 32, 37, 38, 59, 60, 39, 40) for visual consistency.

## Consequences
- Clearer page identity: the tab is the Kanban view; tickets are listed in a dedicated card below.
- Tickets card provides a quick scan of open vs done tickets without scrolling the board.
