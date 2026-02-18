# ADR 0265 — Run redirect page at /run

## Status

Accepted.

## Context

- The Dashboard entity links include "Run" with `href="/run`.
- The Run history card on the Dashboard has a "View Run" link to `/run`.
- No Next.js route existed for `/run`, so these links resulted in a 404.
- The command palette action "Go to Run" (⌘⇧W) already navigates to the first active project's Worker tab via `goToRun()` (resolve first active project, then `router.push(\`/projects/${proj.id}?tab=worker\`)`).

## Decision

- Add a dedicated **Run redirect page** at `src/app/run/page.tsx`.
- The page is a client component that on mount:
  - Reads `activeProjects` from the run store.
  - If empty: toast "Select a project first", then `router.replace("/projects")`.
  - Otherwise: calls `listProjects()`, finds the project whose `repoPath` matches `activeProjects[0]`, then `router.replace(\`/projects/${id}?tab=worker\`)`.
  - If no matching project or list fails: toast and redirect to `/projects`.
- While resolving, the page shows a short "Redirecting to Run…" message.
- Logic mirrors CommandPalette `goToRun` so behaviour is consistent.

## Consequences

- Dashboard "Run" link and Run history card "View Run" link work instead of 404.
- Single place for "go to run" redirect logic; command palette keeps its own handler for instant navigation without a full page load.
- No new dependencies; uses existing `useRunState`, `listProjects`, and Next.js `useRouter`.
