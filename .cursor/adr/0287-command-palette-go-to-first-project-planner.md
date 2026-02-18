# ADR 0287 — Command palette: Go to first project Planner

## Status

Accepted.

## Context

The command palette has "Go to first project Ideas", "Go to first project Documentation", "Go to first project Frontend", "Go to first project Backend", and "Go to first project Milestones" — each navigates to the first active project with the corresponding tab selected. The **Planner** tab (value `todo`) shows the tickets/Kanban UI (`ProjectTicketsTab`). There was no palette action to jump directly to the first project's Planner tab; users had to open the project and switch to the Planner tab manually.

## Decision

- Add **Go to first project Planner** to the command palette in `CommandPalette.tsx`:
  - New callback `goToFirstProjectPlanner`: same pattern as `goToFirstProjectMilestones` — resolve first active project, then `router.push(\`/projects/${proj.id}?tab=todo\`)`.
  - One action entry with label "Go to first project Planner", icon `ListTodo`, placed after "Go to first project Milestones", before "Go to first project". Close palette on select.
- Document in `keyboard-shortcuts.ts`: add "Go to first project Planner" under the Command palette group.

## Consequences

- Keyboard-first users can open ⌘K and select "Go to first project Planner" to navigate to the first active project's Planner (tickets/Kanban) tab without opening the project and switching tabs.
- Parity with other "Go to first project X" entries (Ideas, Documentation, Frontend, Backend, Milestones). No new lib or route; reuses existing project resolution and URL pattern.
