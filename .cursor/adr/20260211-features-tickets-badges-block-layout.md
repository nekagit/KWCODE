# ADR 20260211: Features and Tickets badges block layout (project detail)

## Status
Accepted

## Context
On the project detail Todo tab, the Features column (In progress / Done badges) and the Tickets column (In progress / Done) were visually ending up behind or squeezed by the Terminals column. They did not reliably take their own block space in the grid.

## Decision
- **Features column (Column 1):** Use `relative z-10`, `min-w-[200px]`, and `shrink-0` so the column reserves block space and stacks above adjacent content (e.g. terminals).
- **Tickets column (Column 4):** Use `relative z-10`, `min-w-[200px]` (in addition to existing `shrink-0` and `max-h-[380px]`) so it also reserves block space and stacks above.
- **Terminals column:** No overflow change; keep `overflow-auto` so terminal logs can scroll. Rely on Features/Tickets having higher stacking and minimum width to prevent overlap.

## Consequences
- Features and Tickets columns get a minimum width (200px) and no longer shrink below that, so the In progress / Done badges keep a stable, block-like area.
- Higher stacking (`z-10`) ensures these sections render above the terminals when layout or overflow would otherwise overlap.
- Grid layout remains responsive; other columns (Kanban, Terminals) still use `flex-1` and can take remaining space.
