# ADR: Tickets section — block styling, stacking, and size

## Date
2026-02-11

## Status
Accepted

## Context
The tickets section (column to the right of the Kanban board on the Todo tab) had layout issues:
- It did not read as a clear block and could appear to sit behind the Features column or the Features/Prompts tab sections below.
- The section could grow too large, dominating the view and making the Features and Prompts cards feel overlapped or hidden.

## Decision
1. **Stacking (z-index):** Add `relative z-10` to the Tickets column wrapper so it stacks above adjacent columns and the Features/Prompts sections when overlap occurs.
2. **Size:** Add `max-h-[380px]` to the Tickets column so the block has a bounded height; content scrolls via existing `overflow-auto`. Add `shrink-0` so the column keeps a stable block size.
3. **Grid row:** Add `max-h-[75vh] min-h-0 shrink-0` to the main grid container so the Kanban row does not grow unbounded and the sections below (Features tab, Prompts tab) start in normal flow without overlapping.
4. **Root:** Add `shrink-0` to the ProjectTicketsTab root so the tab does not over-grow and contribute to overlap.

## Consequences
- The tickets section reads as a clear, card-like block and no longer appears behind the Features or Prompts cards.
- Ticket list height is capped and scrolls inside the block; the section is no longer “too big.”
- The Kanban row has a reasonable max height so the following sections remain visible and in flow.
