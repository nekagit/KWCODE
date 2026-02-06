# ADR 039: Projects API 404 in Tauri – backend + frontend helper

## Status

Accepted.

## Context

The app serves projects via Next.js API routes (`/api/data/projects`, `/api/data/projects/[id]`, etc.). When running inside Tauri with a **static export** (production build), there is no Next server: the frontend is loaded from the built `out/` directory, so any `fetch("/api/data/projects")` resolves against the app origin and returns **404 (Not Found)**. Users saw repeated 404s for the "projects" resource.

## Decision

1. **Tauri backend (Rust)**  
   Add commands that read/write `data/projects.json` so the same data is available without a Next server:
   - `list_projects` → JSON array of all projects  
   - `get_project(id)` → single project JSON or error  
   - `create_project(body)` → create project (id/timestamps set if missing), return created project  
   - `update_project(id, body)` → replace project by id  
   - `delete_project(id)` → remove project by id  

   Use `chrono` for ISO timestamps on create. Register these in the Tauri `invoke_handler`.

2. **Frontend API helper (`src/lib/api-projects.ts`)**  
   - When `isTauri()`: use `invoke` for list, get, create, update, delete (and a minimal export that returns project + empty linked entities in Tauri).  
   - When not Tauri: use `fetch` to existing Next API routes.  
   Expose: `listProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject`, `getProjectExport`.

3. **Pages**  
   - **Projects list** (`/projects`): use `listProjects()` and `deleteProject()` from the helper instead of raw `fetch`.  
   - **Project detail** (`/projects/[id]`): when Tauri, use `getProject(id)` and build a minimal `ResolvedProject` (empty resolved arrays); use `updateProject` for save and `getProjectExport` for export.  
   - **Project new** (`/projects/new`): use `createProject()` from the helper.  
   - **Project edit** (`/projects/[id]/edit`): when Tauri use `getProject(id)` for load and empty lists for prompts/tickets/etc.; use `updateProject` on save.

## Consequences

- In Tauri (dev or production), projects list and project CRUD work without a Next server; no more 404s for `/api/data/projects`.  
- In the browser (Next dev server), behavior is unchanged: requests still go to the Next API.  
- Project detail and edit in Tauri show project metadata and link IDs; resolved prompts/tickets/features/ideas/designs/architectures are empty until equivalent Tauri commands or file reads are added for those entities.  
- Single source of truth remains `data/projects.json`; both Next API and Tauri commands read/write it.
