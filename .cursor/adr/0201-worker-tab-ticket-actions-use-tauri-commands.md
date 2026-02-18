# ADR 0201: Worker tab ticket actions use Tauri commands in built app

## Status

Accepted.

## Context

In the **built** (production) Tauri app, the Worker tab shows a Kanban with actions "Mark done", "Redo", and "Archive" for plan tickets. Those actions were implemented with **fetch** to `/api/data/projects/.../tickets` and `/api/data/projects/.../kanban-state`. In the built app the WebView loads from the asset protocol (e.g. `https://asset.localhost/`). Relative fetch requests hit the asset origin and can trigger the same "The string did not match the expected pattern" URL parse error as in ADR 0200 (Fast development). So Mark done, Redo, and Archive could fail or misbehave in the desktop build.

## Decision

- **Backend (Rust)**  
  - In `db.rs`: add `update_plan_ticket(conn, project_id, ticket_id, done, status)` to set a plan ticket’s `done` and `status` ("Todo" / "Done"); add `delete_plan_ticket(conn, project_id, ticket_id)` to remove a plan ticket.  
  - In `lib.rs`: add Tauri commands `update_plan_ticket` and `delete_plan_ticket`, and register them in the invoke handler.
- **Frontend**  
  - In **ProjectRunTab.tsx**, in `handleMarkDone`, `handleRedo`, and `handleArchive`: when **isTauri** is true, use `invoke("update_plan_ticket", …)` for Mark done/Redo and `invoke("delete_plan_ticket", …)` plus `invoke("set_plan_kanban_state", …)` for Archive. When **isTauri** is false (browser dev), keep the existing **fetch** calls to the Next.js API routes.
- No changes to API routes or to the Planner (Tickets tab); only the Worker tab and the new Tauri commands are in scope.

## Consequences

- Worker tab Mark done, Redo, and Archive work in the built desktop app without triggering URL parse errors.
- Behaviour in browser dev is unchanged (still uses API routes).
- Aligns with ADR 0200: Tauri commands are used in desktop mode to avoid fetch to `/api` and asset-origin issues.
