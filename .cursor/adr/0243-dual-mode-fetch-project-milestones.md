# ADR 0243: Dual-mode fetch for project milestones

## Status

Accepted.

## Context

Project milestones were loaded only via `fetch(\`/api/data/projects/${projectId}/milestones\`)`, which requires the Next.js server. In Tauri desktop mode the backend already exposes `get_project_milestones`. Command palette and Milestones tab both used direct fetch, so Tauri users depended on the API server for milestones.

## Decision

- Add a single **`src/lib/fetch-project-milestones.ts`** module:
  - **Tauri:** `invoke("get_project_milestones", projectIdArgPayload(projectId))`, map raw rows to `MilestoneRecord`.
  - **Browser:** GET `/api/data/projects/:id/milestones`, return JSON as `MilestoneRecord[]`.
- Export **`fetchProjectMilestones(projectId): Promise<MilestoneRecord[]>`**; throw on error; caller handles toasts/UI.
- Use it in **CommandPalette** (`resolveFirstProjectMilestones`) and **ProjectMilestonesTab** (`loadMilestones`).
- **Follow-up:** All other consumers were unified to use `fetchProjectMilestones`: **ProjectControlTab** (load), **ProjectRunTab** (Fast development flow), **ProjectTicketsTab** (`loadMilestonesAndIdeas`). No remaining direct fetch/invoke splits for milestone list loading.

## Consequences

- In Tauri mode, milestones load from the Rust backend without depending on the Next.js API.
- Single source of truth for how milestones are fetched; same pattern as `fetch-implementation-log` and `fetch-project-tickets-and-kanban`.
- Browser mode unchanged (still uses existing API route).
