# ADR 047: All data and project details – single source in Tauri

## Status

Accepted.

## Context

Users saw a mismatch: the **All data** tab (dashboard) showed **0 tickets and 0 features**, while the **project details view** showed **many** (e.g. 30 tickets, 12 features). Both should reflect the same underlying data.

- **All data** (and Tickets/Feature tabs) in Tauri load tickets and features from the **Tauri backend**: `get_tickets()` (SQLite) and `get_features()` (features.json then DB).
- **Project details** was loading the project via **Next.js API** `GET /api/data/projects/[id]`, which reads from **data/*.json** (tickets.json, features.json) on the server. When the Next dev server was running, that API returned data from the filesystem, which could differ from what the Tauri backend had (e.g. seed data in JSON vs empty or different SQLite).

So two different sources caused the discrepancy.

## Decision

1. **Tauri backend – `get_project_resolved(id)`**  
   Add a new Tauri command that returns a single project with **resolved** prompts, tickets, features, ideas, designs, and architectures using the **same sources** as the dashboard:
   - Tickets from `get_tickets()` (SQLite)
   - Features from `get_features()` (features.json if present, else DB)
   - Prompts, ideas, designs, architectures from data dir JSON (same layout as API)
   - Entity categories from the project merged onto each resolved entity.

2. **Frontend – use resolved project in Tauri**  
   When running in Tauri, the project details page loads the project via **`getProjectResolved(id)`** (which calls `get_project_resolved`) instead of `fetch(/api/data/projects/${id})`. In browser, the page continues to use the API. So in Tauri, both "All data" and project details use the same backend data; counts stay consistent.

3. **API helper**  
   Add `getProjectResolved(id)` in `api-projects.ts`: in Tauri it invokes `get_project_resolved`; otherwise it fetches the existing API route. Export a `ResolvedProject` type for the response shape.

## Consequences

- In Tauri, project details view and All data (and Tickets/Feature tabs) now show the same ticket and feature counts; no more mismatch.
- When tickets/features are stored only in SQLite (or only in features.json in Tauri), both views reflect that single source.
- In browser mode, behavior is unchanged (API still used for project and for data).
- Refetch on the project details page (e.g. after edit) uses the same path: in Tauri, `getProjectResolved(id)`.
