# ADR 0230: Refactor — shared module for fetching project tickets and kanban state

## Status

Accepted.

## Context

ProjectTicketsTab and ProjectRunTab both implemented the same dual-mode load for project tickets and kanban state: Tauri uses `get_project_tickets` and `get_project_kanban_state` via invoke; browser uses `GET /api/data/projects/:id/tickets` and `GET /api/data/projects/:id/kanban-state`. The fetch logic, API row shape (TicketRow), and mapping to ParsedTicket were duplicated in both components, making changes error-prone and violating DRY.

## Decision

- Introduce **`src/lib/fetch-project-tickets-and-kanban.ts`** exporting **`fetchProjectTicketsAndKanban(projectId: string)`** that returns `Promise<{ tickets: ParsedTicket[]; inProgressIds: string[] }>`.
- The module performs dual-mode fetch (invoke when isTauri, fetch both API URLs otherwise), maps API rows to ParsedTicket, and throws on error so callers keep their existing catch/finally (setKanbanError, frontend_debug_log, ingest logging).
- **ProjectTicketsTab** and **ProjectRunTab** call `fetchProjectTicketsAndKanban(projectId)` in `loadTicketsAndKanban`, then `buildKanbanFromTickets(tickets, inProgressIds)` and `setKanbanData(data)`. All existing try/catch/finally and debug/ingest behaviour remain unchanged.

## Consequences

- Single place for the tickets + kanban fetch contract; future API or mapping changes are done once.
- Behaviour unchanged; existing tests and UX (loading, error, debug logs) preserved.
- Both tabs remain responsible for loading state, error state, and logging; only the data-fetch and row-mapping logic are shared.
