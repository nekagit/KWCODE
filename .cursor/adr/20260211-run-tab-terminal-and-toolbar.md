# ADR: New Run tab with terminal and toolbar

## Date
2026-02-11

## Status
Accepted

## Context
The project details page had a single "Todo" tab that contained the Implement All toolbar, three terminal slots, Kanban, Features, and Tickets. Users requested a dedicated "Run" tab and to move the terminal section and toolbar buttons there.

## Decision
- **New tab "Run"** added to the project details tabs (between Todo and Setup), with a Play icon.
- **New component `ProjectRunTab`** (`TabAndContentSections/ProjectRunTab.tsx`):
  - Loads kanban data (tickets.md, features.md) for the toolbar’s prompt/context.
  - Renders `ImplementAllToolbar` (Open in system terminal, Implement All, prompt selector, Add prompt, Stop all, Clear, Archive).
  - Renders the **Terminals** section with `ImplementAllTerminalsGrid` (three terminal slots).
  - Handles empty states: no repo path, not Tauri (web), and loading/error for kanban.
- **Exports from `ProjectTicketsTab`**: `ImplementAllToolbar` and `ImplementAllTerminalsGrid` are exported so `ProjectRunTab` can reuse them.
- **Todo tab** no longer shows the toolbar or the Terminals section; it only shows Add ticket / Add feature, Kanban, Features, and Tickets.

## Consequences
- Run-related UI (toolbar + terminals) is grouped under Run; Todo focuses on tickets and kanban.
- Kanban data is loaded in both Run (for toolbar context) and Todo (for board and features/tickets). No shared state between tabs.
- Run tab is the single place to start runs and view terminal output.
