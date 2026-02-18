# ADR 0278 — Design and Architecture redirect pages /design, /architecture

## Status

Accepted.

## Context

- Run, Testing, Database, Shortcuts, and Planner have dedicated top-level redirect routes: `/run`, `/testing`, `/database`, `/shortcuts`, `/planner`.
- The command palette has "Go to Design" (⌘⇧D) and "Go to Architecture" (⌘⇧A) that navigated to the first active project's Control tab with `#design` or `#architecture` via in-palette logic; there was no bookmarkable `/design` or `/architecture` URL.
- Duplicating redirect logic in the palette prevented a single canonical URL for Design and Architecture.

## Decision

- Add **Design redirect page** at **/design** and **Architecture redirect page** at **/architecture** that redirect to the first active project's Control tab with `#design` or `#architecture` on mount (`/projects/{id}?tab=project#design` or `#architecture`), or to `/projects` with a toast when no project is selected (same pattern as `/run` and `/planner`).
- Add `/design` → "Design" and `/architecture` → "Architecture" to the page title map so the document title is correct during the redirect.
- **CommandPalette** `goToDesign` and `goToArchitecture` use `router.push("/design")` and `router.push("/architecture")` so the redirect pages own the logic (single source of truth).
- **Dashboard** entity links row includes Design and Architecture pointing to `/design` and `/architecture` for one-click access from the Dashboard.

## Consequences

- Users can bookmark or share the URLs `/design` and `/architecture`; they behave like `/run`, `/planner`, and `/testing` as canonical top-level routes.
- Command palette "Go to Design" and "Go to Architecture" and their global shortcuts now delegate to `/design` and `/architecture`, reducing duplicated logic.
- Dashboard users can open Design or Architecture for the first active project with one click from the entity links row.
- No change in behaviour for the Control tab content; only the URL and entry-point flow are unified.
