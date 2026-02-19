# ADR 0327: get_ideas_list — projectIdArgOptional payload in built version

## Status

Accepted.

## Context

In the **built** Tauri app, calls to `get_ideas_list` failed with:

`invalid args projectIdArgOptional for command get_ideas_list: command get_ideas_list missing required key projectIdArgOptional`

The command `get_ideas_list` takes a single parameter of type **`ProjectIdArgOptional`** (unlike `get_project_tickets`, `get_project_kanban_state`, etc., which take **`ProjectIdArg`**). Tauri IPC expects the top-level key to be the **camelCase of the parameter type**: so `projectIdArgOptional` for `ProjectIdArgOptional`, and `projectIdArg` for `ProjectIdArg`. The frontend was using `projectIdArgPayload()` for all of them, which sends `{ projectIdArg: { projectId } }`. That is correct for `ProjectIdArg` commands but wrong for `get_ideas_list`, which requires `{ projectIdArgOptional: { projectId } }`.

## Decision

- Add **`projectIdArgOptionalPayload(projectId: string | null)`** in `@/lib/tauri` that returns `{ projectIdArgOptional: { projectId } }`.
- Use `projectIdArgOptionalPayload` for every invoke of **`get_ideas_list`** only.
- Keep using **`projectIdArgPayload`** for commands that take **`ProjectIdArg`** (`get_project_tickets`, `get_project_kanban_state`, `get_project_milestones`, `get_implementation_log_entries`).
- Updated **fetch-ideas.ts**, **ProjectTicketsTab.tsx**, and **ProjectControlTab.tsx** to call `get_ideas_list` with `projectIdArgOptionalPayload(projectId)` or `projectIdArgOptionalPayload(null)`.

## Consequences

- `get_ideas_list` works in the built app (Ideas list in Planner/Control and command-palette export).
- Clear split: `projectIdArgPayload` for `ProjectIdArg`, `projectIdArgOptionalPayload` for `ProjectIdArgOptional`.
- ADR 0226 described using one payload for both; in practice the IPC key is type-derived, so optional-arg commands need the optional payload helper.
