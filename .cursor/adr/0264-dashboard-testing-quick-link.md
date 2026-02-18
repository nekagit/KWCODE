# ADR 0264: Dashboard Testing quick link in entity links

## Status

Accepted.

## Context

The Dashboard shows entity quick links for Projects, Ideas, Technologies, Prompts, Run, Documentation, Configuration, and Loading. "Go to Testing" (⌘⇧Y) and the command palette navigate to the first active project's Testing tab; there is no global /testing page. Users had no one-click way to open the first project's Testing tab from the Dashboard without using the sidebar or command palette.

## Decision

Add a **Testing** quick link to the Dashboard entity links row:

- Same visual style as other entity links (rounded border, card background, icon + label).
- Implemented as a **button** with `onClick` (not a static href) because Testing is project-scoped: navigate to the first active project's Testing tab (`/projects/${id}?tab=testing`).
- If no project is active or the first active project cannot be resolved: toast "Select a project first" or "Open a project first" and navigate to `/projects`.
- Use `TestTube2` icon and emerald accent (`text-emerald-600 dark:text-emerald-400`) for consistency with the Testing tab elsewhere.
- Place after Run so the order is: Projects, Ideas, Technologies, Prompts, Run, **Testing**, Documentation, Configuration, Loading, Database.
- Reuse existing store (`activeProjects`) and data (`projects` / `listProjects`) already used on the Dashboard; add `goToTesting` handler and `useCallback` for stability.

## Consequences

- Users can jump to the first active project's Testing tab from the Dashboard with one click.
- Behaviour matches the command palette "Go to Testing" and ⌘⇧Y shortcut.
- Single component change (DashboardOverview); no new routes or backend.
