# ADR 0226: get_project_tickets (and ProjectIdArg commands) — projectIdArg in built version

## Status

Accepted.

## Context

In the **built** Tauri app, the Planner tab and Control tab failed with:

`invalid args projectIdArg for command get_project_tickets: command get_project_tickets missing required key projectIdArg`

The frontend was passing `{ projectId }` (flat struct) for commands that take a single `ProjectIdArg` or `ProjectIdArgOptional`. In the built app, Tauri’s IPC expects the **parameter name** (derived from the Rust type name in camelCase) as the top-level key: `projectIdArg`. So the payload must be `{ projectIdArg: { projectId } }` for the backend to accept it.

## Decision

- Use the payload shape **`{ projectIdArg: { projectId } }`** for all Tauri commands that take a single `ProjectIdArg` or `ProjectIdArgOptional`.
- Added **`projectIdArgPayload(projectId: string | null)`** in `@/lib/tauri` that returns this shape; use it for every invoke of:
  - `get_project_tickets`
  - `get_project_kanban_state`
  - `get_project_milestones`
  - `get_implementation_log_entries`
  - `get_ideas_list`
- Updated **ProjectRunTab.tsx** (Worker), **ProjectTicketsTab.tsx** (Planner), **ProjectControlTab.tsx** (Control), and **fetch-ideas.ts** to call these commands with `projectIdArgPayload(projectId)` or `projectIdArgPayload(null)` for optional project.
- ADR 0217 updated to reference this shape and ADR 0226.

## Consequences

- Planner and Control tabs (and Worker Fast development) work in the built app.
- Single source of truth for the payload shape via `projectIdArgPayload()`.
