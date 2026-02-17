# ADR 0061: Planner tab — remove Planner Files section

## Status
Accepted (2025-02-17)

## Context
The Planner tab showed two blocks: (1) PlannerFilesSection (repo files / planner docs) when `project.repoPath` was set, and (2) ProjectTicketsTab (kanban, tickets). The files section was removed from the tab to simplify the Planner view.

## Decision
- Remove `PlannerFilesSection` from the Planner tab in `ProjectDetailsPageContent`.
- Remove the import of `PlannerFilesSection`.
- The Planner tab now only renders `ProjectTicketsTab` (tickets/kanban) inside the existing card wrapper.

## Consequences
- Planner tab is focused on tickets/planner UI only.
- The `PlannerFilesSection` component file is left in the codebase in case it is reused elsewhere or restored later.
