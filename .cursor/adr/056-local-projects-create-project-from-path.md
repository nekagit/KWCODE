# ADR 056: Local projects – select path and create project

## Status

Accepted.

## Context

ADR 055 added a "Local projects" section on the Projects page listing paths from `data/all_projects.json`. Users need to pick one of those paths and create a new first-class project in the app with that repo path (and optionally a default name).

## Decision

- **Projects page (Local projects section)**:
  - Each path row shows the path and a **"Create project"** button.
  - Button links to `/projects/new?repoPath=${encodeURIComponent(path)}`.
  - Rows use flex layout (path truncates, button shrinks-0) and hover background for clarity.
- **New project page**:
  - Read `repoPath` from `useSearchParams().get("repoPath")` in a `useEffect`.
  - When present: set repo path field to the decoded value; if name is still empty, set name to the last path segment (e.g. `/foo/bar/my-app` → "my-app").
  - No overwriting of name if the user has already entered one (effect only sets name when `!name`).

## Consequences

- User can select a local path and create a project in one flow: click "Create project" next to the path → new project form opens with repo path and a suggested name pre-filled.
- Same new-project form and API; no new routes. Query param is optional so existing "New project" entry points still work.
