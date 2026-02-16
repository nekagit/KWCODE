# ADR 0020: Project details prev/next navigation and default Planner tab

## Status

Accepted.

## Context

Users wanted to move between projects from the project details page without going back to the list, and to land on the Planner tab by default when opening a project.

## Decision

- **Prev/next navigation:** On the project details hero header, add left and right arrows around the project title. Clicking left goes to the previous project (by list order), right to the next. Arrows are disabled (dimmed, not clickable) when there is no previous or next project. Project order is the same as `listProjects()`.
- **Default tab:** The initial tab when opening project details is **Planner** (`todo`), not Setup. State is `useState("todo")` so the first tab shown is Planner.

## Implementation

- `ProjectDetailsPageContent.tsx`: load `projectIds` via `listProjects()` in an effect; derive `prevId`/`nextId` from current index; render `<Link href={/projects/prevId}>` / next with arrow icons; left/right use disabled-style span when no prev/next. Default tab state set to `"todo"`.

## Consequences

- Faster switching between projects from the detail view.
- Planner is the primary entry point for project work.
- One extra `listProjects()` call when the details page mounts (acceptable).
