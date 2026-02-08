# ADR 105: Todos tab — Kanban top card, all others collapsed by default

## Status
Accepted

## Context
On the project details Todos tab, the accordion had four cards (Prompt, Kanban, Files in .cursor, Features & Tickets) all expanded by default. Users wanted the Kanban board to be the primary focus: visible first and the only card open by default.

## Decision
1. **Default open**  
   Change the Todos accordion `defaultValue` from `["todos-prompt", "todos-kanban", "cursor-files", "todos-features-tickets"]` to `["todos-kanban"]` so only the Kanban card is expanded on load.

2. **Order**  
   Move the Kanban accordion item to the first position so it appears as the top card. Order is now: Kanban, Prompt, Files in .cursor, Features & Tickets.

## Consequences
- Kanban is immediately visible without scrolling; other cards stay collapsed until the user expands them.
- Single Kanban implementation is kept (the duplicate “Features (from features.md)” / “Tickets (from tickets.md)” variant that appeared later in the accordion was removed to avoid two Kanban cards).
