# ADR 0310: Bugfix — Fast development "Failed to create ticket or start agent" (create_plan_ticket / set_plan_kanban_state args in built app)

## Status

Accepted.

## Context

In the **built** Tauri app, the Worker tab’s **Fast development** flow could still fail with "Failed to create ticket or start agent" after prior fixes (ADR 0217, 0220, 0226, 0227). Those fixes addressed `ProjectIdArg` payload shape and `run_run_terminal_agent` using an `args` wrapper. The commands `create_plan_ticket` and `set_plan_kanban_state` were still defined in Rust with **multiple** parameters. In the built app, Tauri IPC can require the payload to use the **parameter name** as the top-level key when a command has a single parameter; for consistency with `run_run_terminal_agent` and to avoid deserialization issues in the built app, these two commands should accept a single `args` struct so the frontend sends `{ args: { ... } }`.

## Decision

- **Backend (Rust):**
  - Introduce `CreatePlanTicketArgs` with fields `project_id`, `title`, `description`, `priority`, `feature_name`, `milestone_id`, `idea_id`, `agents` and `#[serde(alias = "projectId")]` (and camelCase aliases where useful). Change `create_plan_ticket` to take a single parameter: `args: CreatePlanTicketArgs`.
  - Introduce `SetPlanKanbanStateArgs` with `project_id` and `in_progress_ids` (and camelCase aliases). Change `set_plan_kanban_state` to take a single parameter: `args: SetPlanKanbanStateArgs`.
- **Frontend:**
  - Add **`createPlanTicketPayload(...)`** and **`setPlanKanbanStatePayload(projectId, inProgressIds)`** in `@/lib/tauri` that return `{ args: { ... } }`.
  - Update **ProjectRunTab.tsx** to use these payload helpers for all invokes of `create_plan_ticket` and `set_plan_kanban_state` (Fast development flow and Kanban Archive action).

## Consequences

- Fast development flow works reliably in the built desktop app: ticket creation, kanban state update, and terminal agent start all succeed.
- Aligns with the single-arg payload pattern used for `run_run_terminal_agent` (ADR 0220, 0227) and `ProjectIdArg` (ADR 0226).
- Worker tab Kanban "Archive" action also uses the new payload for `set_plan_kanban_state`, so it remains correct in the built app.
