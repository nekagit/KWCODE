# ADR 150: ProjectTicketsKanbanColumn — organisms consist of molecules only

## Status

Accepted.

## Context

`ProjectTicketsKanbanColumn` (organism) contained inline JSX using atoms and shared/UI components (Card, Button, Badge, ScrollArea, icons, ButtonGroup, Link). The user requested that organisms consist of molecules only to enforce a clear atomic-design boundary: organisms compose molecules; molecules compose atoms and shared/UI.

## Decision

- Introduce a Kanban molecule layer under `src/components/molecules/Kanban/`:
  - **KanbanColumnHeader**: column id, name, count, and status icon (backlog / in_progress / done / blocked).
  - **KanbanTicketCard**: single ticket card (title, priority badge, description, feature badge, Done button, Open link).
  - **KanbanColumnCard**: full column UI — Card wrapper, KanbanColumnHeader, ScrollArea, and list of KanbanTicketCard.
- Refactor **ProjectTicketsKanbanColumn** so it only renders **KanbanColumnCard**, passing through `columnId`, `column`, `projectId`, and `handleMarkDone`. It keeps the same public props (including `kanbanFeatures`) for the parent; `kanbanFeatures` is not used inside the column and is not passed to KanbanColumnCard.

## Consequences

- Organism file is minimal and only imports one molecule; all column/ticket UI lives in molecules.
- KanbanColumnHeader and KanbanTicketCard are reusable for other Kanban views if needed.
- Clear separation: organisms = composition of molecules; molecules = composition of atoms/shared/UI.
