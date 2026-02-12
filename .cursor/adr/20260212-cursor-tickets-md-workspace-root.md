# ADR: Add .cursor/tickets.md at workspace root to fix file-not-found error

## Date
2026-02-12

## Status
Accepted

## Context
The application and some tooling expect planner files at `.cursor/planner/tickets.md` and `.cursor/planner/features.md`. The data API (`src/app/api/data/route.ts`) and project Kanban flows read/write these under project repo paths; at app root, the data route reads from `.cursor/planner/` for browser mode.

## Decision
- Use `.cursor/planner/tickets.md` and `.cursor/planner/features.md` as the canonical paths for Kanban and data API.

## Consequences
- Planner files live under `.cursor/planner/`; format matches the scaffold in `script/scaffold-cursor-md.mjs`.
