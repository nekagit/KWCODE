# ADR 099: Kanban — green border on tickets only; features only moved in Done tab

## Status
Accepted

## Context
On the project details Todos tab, the Kanban board shows features (To do / Done columns) and tickets (P0–P3). Previously both feature cards and ticket cards showed a green border and checkmark when done, which was redundant for features since their only state is which column they are in.

## Decision
- **Tickets**: Keep the green border (`border-emerald-500 ring-1 ring-emerald-500/30`) and checkmark icon when a ticket is done. Tickets are the checklist items; the green styling clearly marks completion.
- **Features**: Remove the green border and checkmark from feature cards. Features are only “moved” between the “To do” and “Done” columns; the column itself indicates status. No extra border or icon on feature cards.

## Consequences
- Clearer visual hierarchy: completion styling is reserved for tickets.
- Features are distinguished only by column (To do vs Done).
