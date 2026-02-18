# ADR 0277 — Planner redirect page /planner

## Status

Accepted.

## Context

- Run, Testing, Database, and Shortcuts have dedicated top-level routes: `/run`, `/testing`, `/database`, `/shortcuts`.
- "Go to Planner" (⌘⇧J) and the command palette action navigated to the first active project's Planner (todo) tab via in-palette logic (`/projects/{id}?tab=todo`); there was no bookmarkable `/planner` URL.
- Duplicating redirect logic in the palette matched run/testing but prevented a single canonical URL for the Planner.

## Decision

- Add a **Planner redirect page** at **/planner** that redirects to the first active project's todo tab (`/projects/{id}?tab=todo`) on mount, or to `/projects` with a toast when no project is selected (same pattern as `/run` and `/testing`).
- Add `/planner` → "Planner" to the page title map so the document title is "Planner" during the redirect.
- Simplify **CommandPalette** `goToPlanner` to `router.push("/planner")` so the redirect page owns the logic (single source of truth).

## Consequences

- Users can bookmark or share the URL `/planner`; it behaves like `/run` and `/testing` as a canonical top-level route.
- Command palette "Go to Planner" and the global shortcut ⌘⇧J / Ctrl+Alt+J now delegate to `/planner`, reducing duplicated logic.
- No change in behaviour for the Planner (todo) tab content; only the URL and entry-point flow are unified.
