# ADR 0064: Worker tab — Queue and Other in progress below Terminal

## Status
Accepted (2025-02-17)

## Context
In the Worker tab, the Queue (In Progress tickets from DB) was at the top (below Status Bar), and "Other in progress" was below the Terminal section. The user wanted Queue and Other in progress grouped together below the Terminal section.

## Decision
- Move `WorkerGeneralQueueSection` (Queue) from its position after the Status Bar to directly below `WorkerTerminalsSection` (Terminal).
- Keep `WorkerTicketQueue` (Other in progress) immediately after Queue.
- Order is now: Status Bar → Command Center → Fast development → Debugging → **Terminals** → **Queue** → **Other in progress**.

## Consequences
- Queue and Other in progress sit together under the Terminal section for a clearer flow: run terminals first, then manage queue and remaining in-progress tickets below.
