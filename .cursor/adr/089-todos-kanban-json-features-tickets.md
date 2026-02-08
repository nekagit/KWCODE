# ADR 089: Todos Kanban and JSON from features.md & tickets.md

## Status

Accepted.

## Context

Users wanted to see features and tickets in a Kanban view and have the data available as JSON. The project already loads `.cursor/features.md` and `.cursor/tickets.md` in the Todos tab; there was no structured representation or board-style display.

## Decision

1. **JSON structure and parser**
   - Introduce a canonical JSON shape for parsed todos: `TodosKanbanData = { features: ParsedFeature[], tickets: ParsedTicket[], parsedAt: string }`.
   - **ParsedFeature:** `id`, `title`, `ticketRefs` (number[]), `done` (from `- [ ]` / `- [x]` in features.md).
   - **ParsedTicket:** `id`, `number`, `title`, `description?`, `priority` (P0|P1|P2|P3), `featureName`, `done` (from checklist and `#### Feature:` in tickets.md).
   - Parser lives in `src/lib/todos-kanban.ts`: `parseFeaturesMd`, `parseTicketsMd`, `parseTodosToKanban`. Parsing is done client-side when markdown content is available (no new API).

2. **Kanban UI (project details → Todos tab)**
   - Add an accordion section **Kanban (from features.md & tickets.md)**.
   - **Features Kanban:** Two columns — "To do" and "Done". Cards are parsed features; each card shows title, ticket refs (#N), and done state.
   - **Tickets Kanban:** Four columns — P0, P1, P2, P3. Cards are parsed tickets; each card shows #N, title, feature name, optional description, and done state.
   - If both files are missing or parse to empty, show a short message asking the user to add the files (e.g. via Analysis).

3. **JSON export**
   - **Copy JSON** button in the Kanban section copies `TodosKanbanData` (pretty-printed) to the clipboard and shows a toast. This gives a single, consistent way to get the data as JSON.

4. **Documentation**
   - `.cursor/sync.md`: Add item 3 describing the Kanban/JSON representation and that the parser depends on the formats in items 1 and 2.

## Consequences

- Features and tickets from the markdown files are visible in a Kanban and consumable as JSON without a new backend.
- Parser is tied to the current markdown format (features checklist, tickets under ### P0–P3 and #### Feature:); format changes may require parser updates.
- Kanban is read-only (no drag-to-update markdown); edits remain in the repo files.
