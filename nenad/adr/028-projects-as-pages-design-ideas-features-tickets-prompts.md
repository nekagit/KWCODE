# ADR 028: Projects as first-class pages (design, ideas, features, tickets, prompts)

## Status

Accepted.

## Context

Projects should not be only "repo paths" for running prompts. Users wanted a **project list** and a **project details page** where each project is a page that aggregates design, ideas, features, tickets, and prompts—a single place for all data for that project.

## Decision

- **Project model** (`src/types/project.ts`): Each project has `id`, `name`, `description?`, `repoPath?` (optional repo path for run context), and link lists: `promptIds`, `ticketIds`, `featureIds`, `ideaIds`. Stored in `data/projects.json`.
- **API**:
  - `GET/POST /api/data/projects` — list projects, create project.
  - `GET /api/data/projects/[id]` — single project with **resolved** data: prompts, tickets, features, ideas (from data/*.json) so the details page can show full content.
  - `PUT/DELETE /api/data/projects/[id]` — update and delete project.
- **Project list** (`/projects`): Lists all projects as cards (name, description, counts for prompts/tickets/features/ideas, optional repo path). "New project" → `/projects/new`.
- **New project** (`/projects/new`): Form (name, description, repoPath); on submit POST and redirect to `/projects/[id]`.
- **Project details** (`/projects/[id]`): One page per project showing resolved sections: Prompts, Tickets, Features, Ideas, and a Design entry (link to Design page). Edit button → `/projects/[id]/edit`.
- **Edit project** (`/projects/[id]/edit`): Form to update name, description, repoPath (id arrays can be extended later via API or UI).
- **Nav**: Sidebar "Projects" now points to `/projects` (project list). The dashboard tab that was "Projects" (repo path checkboxes) is renamed to **Active repos**; card title "Active repos (for this run)" and description updated. Quick action "Active repos" on the dashboard switches to that tab.

## Consequences

- Projects are first-class entities; repo paths for runs remain under Dashboard → Active repos.
- Project details page shows all linked prompts, tickets, features, ideas; design is linked via the Design page.
- Linking items to a project (setting promptIds, ticketIds, etc.) is done via Edit project; id arrays are persisted in the API (future: pickers or bulk edit UI).
- Browser mode uses `data/projects.json`; Tauri can later mirror to SQLite if needed.
