# ADR 091: Sync button in Kanban accordion; load and validate for board data

## Status

Accepted.

## Context

The Sync button lived at the top of the Todos tab. The Kanban board could stay empty because it relied on `cursorFeaturesMd` and `cursorTicketsMd` loaded on mount; if the user had just added the files or the project repo was set later, the board would not show data until a full refresh. The user wanted Sync inside the Kanban section so that clicking Sync checks that the .md files exist and are in correct format, and that the parsed JSON is available to show in the Kanban.

## Decision

1. **Move Sync into the Kanban accordion**
   - Removed the Sync row and sync status block from the top of the Todos tab (above the accordion).
   - Placed the Sync button and sync status message inside the **Kanban (from features.md & tickets.md)** accordion content, at the top. Copy reads: "Check that .cursor/features.md and .cursor/tickets.md exist, have correct format, and can be parsed to JSON for the board (see .cursor/sync.md). Click Sync to load and validate."

2. **Sync loads data into the Kanban**
   - When Sync runs, after fetching both files the handler now calls `setCursorFeaturesMd(featuresContent)` and `setCursorTicketsMd(ticketsContent)` with the fetched content. So the same fetch that drives the format/correlation check also updates the display state. The Kanban data (`kanbanData` from `parseTodosToKanban(cursorFeaturesMd, cursorTicketsMd)`) recomputes and the board shows the parsed features and tickets when the files exist and parse correctly.

3. **Empty state and defaults**
   - When there is no parsed data, the Kanban section shows: "No features or tickets parsed yet. Ensure .cursor/features.md and .cursor/tickets.md exist in the project repo (e.g. run Analysis from Features or Tickets cards), then click Sync above to load and validate. The board will show data when the files are present and in the correct format."
   - The Kanban accordion item is included in the default expanded set so the Sync button and board are visible without extra clicks.

## Consequences

- Sync is co-located with the Kanban; one click loads the .mds, validates format/correlation, and refreshes the board.
- The board is no longer empty when the files exist and are valid after clicking Sync (no page refresh needed).
- Todos tab top is simpler; all sync/board flow lives under the Kanban accordion.
