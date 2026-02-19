# ADR 0217: Fast development — fix Tauri invoke payload for ProjectIdArg

## Status

Accepted.

## Context

In **Tauri dev** (and built app), the Worker tab’s **Fast development** flow could fail with "Failed to create ticket or start agent" (or a deserialization error). The flow uses Tauri commands `get_project_milestones`, `get_project_kanban_state`, `create_plan_ticket`, and `set_plan_kanban_state`. The Rust commands that take a single `ProjectIdArg` parameter expect the payload to deserialize directly to that struct (with field `project_id`, or alias `projectId`). The frontend was passing `{ projectIdArg: { projectId } }`, which does not match the struct shape and caused invoke to fail when Tauri deserialized the payload.

## Decision

- For Tauri commands that take a single **ProjectIdArg** parameter, the frontend must pass **`{ projectIdArg: { projectId } }`**. For **ProjectIdArgOptional** (e.g. `get_ideas_list`), the built app IPC expects **`{ projectIdArgOptional: { projectId } }`**. See ADR 0226 and ADR 0327.
- **`projectIdArgPayload(projectId)`** for ProjectIdArg commands; **`projectIdArgOptionalPayload(projectId)`** for `get_ideas_list` only.
- Updated all invocations in:
  - **ProjectRunTab.tsx**: `get_project_milestones`, `get_project_kanban_state`, `get_project_tickets` (projectIdArgPayload).
  - **ProjectTicketsTab.tsx**: `get_project_tickets`, `get_project_kanban_state`, `get_project_milestones` (projectIdArgPayload); `get_ideas_list` (projectIdArgOptionalPayload).
  - **ProjectControlTab.tsx**: `get_implementation_log_entries`, `get_project_milestones` (projectIdArgPayload); `get_ideas_list` (projectIdArgOptionalPayload).
  - **fetch-ideas.ts**: `get_ideas_list` with `projectIdArgOptionalPayload(null)`.
- No changes to Rust commands or to `ProjectIdArg` / `ProjectIdArgOptional`; only the frontend invoke payload shape was corrected.

## Consequences

- Fast development (and other Worker/Planner/Control flows that use these commands) work correctly in Tauri dev and **built app**.
- Invoke payloads use the parameter-key shape required by Tauri’s IPC in the built version.
