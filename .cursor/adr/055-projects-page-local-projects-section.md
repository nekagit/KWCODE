# ADR 055: Projects page – Local projects section

## Status

Accepted.

## Context

The Projects page lists first-class projects from `data/projects.json`. Users also have a list of local repo paths in `data/all_projects.json` (Tauri: from SQLite/kv or file). There was no place on the Projects page to see all those paths.

## Decision

- **New section**: Add a "Local projects" section on the Projects page (`src/app/projects/page.tsx`) as a Card below the template-ideas accordion.
- **Data source**: Load paths from the same source as the dashboard "all projects":
  - **Tauri**: `invoke("get_all_projects")` → array of paths.
  - **Browser**: `fetch("/api/data")` → use `data.allProjects` (from `data/all_projects.json`).
- **UI**: Card with title "Local projects", description referencing `data/all_projects.json`. If empty, show Empty state; otherwise a ScrollArea list of paths (font-mono, truncate, title for full path).
- **State**: `localPaths: string[]` loaded once in the same `useEffect` that loads projects (fire-and-forget for paths so loading/error stay tied to projects list).

## Consequences

- Users can see all local project paths from the JSON in one place on the Projects page.
- Same data as dashboard "all projects"; no new API. Tauri and browser both supported.
