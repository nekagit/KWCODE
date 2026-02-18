# ADR 0217: Fast development — fix Tauri invoke payload for ProjectIdArg

## Status

Accepted.

## Context

In **Tauri dev** (and built app), the Worker tab’s **Fast development** flow could fail with "Failed to create ticket or start agent" (or a deserialization error). The flow uses Tauri commands `get_project_milestones`, `get_project_kanban_state`, `create_plan_ticket`, and `set_plan_kanban_state`. The Rust commands that take a single `ProjectIdArg` parameter expect the payload to deserialize directly to that struct (with field `project_id`, or alias `projectId`). The frontend was passing `{ projectIdArg: { projectId } }`, which does not match the struct shape and caused invoke to fail when Tauri deserialized the payload.

## Decision

- For Tauri commands that take a single **ProjectIdArg** or **ProjectIdArgOptional** parameter, the frontend must pass the struct directly: **`{ projectId }`** (i.e. `{ projectId: projectId }`), not `{ projectIdArg: { projectId } }`.
- Updated all invocations in:
  - **ProjectRunTab.tsx**: Fast development section and Kanban/ticket loading (`get_project_milestones`, `get_project_kanban_state`, `get_project_tickets`).
  - **ProjectTicketsTab.tsx**: `get_project_tickets`, `get_project_kanban_state`, `get_project_milestones`, `get_ideas_list`.
  - **ProjectControlTab.tsx**: `get_implementation_log_entries`, `get_project_milestones`, `get_ideas_list`.
- No changes to Rust commands or to `ProjectIdArg` / `ProjectIdArgOptional`; only the frontend invoke payload shape was corrected.

## Consequences

- Fast development (and other Worker/project flows that use these commands) work correctly in Tauri dev and built app.
- Invoke payloads are consistent with Tauri’s deserialization of a single struct parameter.
