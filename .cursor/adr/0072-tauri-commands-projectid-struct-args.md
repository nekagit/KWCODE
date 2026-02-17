# ADR 0072: Tauri commands use struct args for projectId (camelCase)

## Status
Accepted

## Context
The frontend sends camelCase `projectId` in invoke payloads (e.g. `invoke('get_project_tickets', { projectId })`). Tauri’s generated IPC schema expects that key. Using a raw parameter with `#[serde(rename = "projectId")]` on the command function did not reliably deserialize, leading to: "command get_project_tickets missing required key projectId".

## Decision
- All project-scoped Tauri commands take a **single struct argument** that has a field with `#[serde(alias = "projectId")]` so the frontend’s `{ projectId: "..." }` deserializes correctly.
- Use `ProjectIdArg { project_id: String }` for required project id; use `ProjectIdArgOptional { project_id: Option<String> }` with `#[serde(default)]` for optional project filter (e.g. ideas list).
- Commands updated: `get_project_tickets`, `get_project_kanban_state`, `get_project_milestones`, `get_ideas_list`, `get_implementation_log_entries`.

## Consequences
- Frontend must send the struct under Tauri’s argument key (camelCase of the type name): `{ projectIdArg: { projectId } }` for required, `{ projectIdArgOptional: { projectId } }` for optional (e.g. get_ideas_list). Single flat `{ projectId }` is not accepted when the command takes a struct.
- Consistent pattern for all project-scoped commands and a single place to maintain camelCase ↔ Rust naming.
