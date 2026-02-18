# ADR 0292 — Versioning redirect page /versioning

## Status

Accepted.

## Context

- Run, Testing, Planner, and Database have dedicated redirect pages: `/run`, `/testing`, `/planner`, `/database` redirect to the first active project’s corresponding tab or to a canonical view.
- The Versioning (Git) tab was only reachable via the project detail page (`/projects/:id?tab=git`). "Go to Versioning" (⌘⇧U) and the command palette navigated directly to that URL with inline logic; there was no top-level `/versioning` route.
- The Dashboard entity links included Run, Testing, Planner, and Database but not Versioning, so keyboard and palette users could jump to Versioning but Dashboard had no direct link.

## Decision

- Add a **Versioning redirect page** at **/versioning** that redirects to the first active project’s Versioning (Git) tab (`/projects/:id?tab=git`), or to `/projects` with a toast when no project is selected. Same pattern as `/run`, `/testing`, and `/planner`.
- **Command palette:** Change `goToVersioning` to `router.push("/versioning")` so behaviour is consistent with `goToPlanner` and redirect logic lives in the page.
- **Dashboard:** Add a Versioning entity link (href="/versioning", label="Versioning", icon FolderGit2) to the Dashboard overview entity links.
- **Page title:** Add `/versioning` → "Versioning" to the pathname–title map so the document title is correct during the redirect.

## Consequences

- Users can bookmark or share the URL `/versioning`; it behaves like `/run`, `/testing`, and `/planner` as a canonical top-level route.
- Dashboard users can open Versioning from the entity links in one click.
- ⌘⇧U and the "Go to Versioning" palette action now route through `/versioning`, keeping redirect logic in one place.
