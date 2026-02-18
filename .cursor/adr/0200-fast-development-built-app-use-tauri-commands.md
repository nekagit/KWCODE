# ADR 0200: Fast development in built app — use Tauri commands to avoid URL parse error

## Status

Accepted.

## Context

In the **built** (production) Tauri app, using the Worker tab’s **Fast development** flow (enter command, run agent) caused the error: **"The string did not match the expected pattern."** That message comes from Rust’s `url` crate when `Url::parse()` fails. In the built app the WebView loads from the asset protocol (e.g. `https://asset.localhost/`). The Fast development flow was still using **fetch** to create the ticket and update kanban state (`/api/data/projects/.../tickets` and `/api/data/projects/.../kanban-state`). Those requests hit the asset origin; during handling, URL parsing could fail and surface this error. The backend already exposed Tauri commands for this flow to avoid fetch in Tauri mode: `create_plan_ticket` and `set_plan_kanban_state` (see comments in `src-tauri/src/lib.rs`).

## Decision

- In **WorkerFastDevelopmentSection** (`ProjectRunTab.tsx`), when **isTauri** is true:
  - Create the ticket via **invoke("create_plan_ticket", { project_id, title, description, priority, feature_name, milestone_id, idea_id, agents })** instead of `fetch(.../tickets)`.
  - Update kanban state via **invoke("set_plan_kanban_state", { project_id, in_progress_ids })** instead of `fetch(.../kanban-state)`.
- When **isTauri** is false (browser dev), keep using the existing **fetch** calls to the Next.js API routes.
- No changes to Tauri commands or API routes; only the frontend chooses invoke vs fetch based on environment.

## Consequences

- Fast development works in the built desktop app without triggering URL parse errors.
- Behaviour in browser dev is unchanged (still uses API routes).
- Aligns with the existing design: Tauri commands exist specifically to avoid fetch to `/api` in desktop mode.
