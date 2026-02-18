# ADR 0145 — Dashboard empty state: Discover folders CTA and ?discover=1

## Status

Accepted.

## Context

When the Dashboard shows "No projects yet", it only offered a single link: "Create a project" to `/projects`. Users coming from the empty state had no direct path to the **Discover folders** flow (ADR 0143), which lets them bulk-add projects from the configured root. They had to go to Projects and find the "Discover folders" button manually.

## Decision

- **Dashboard empty state**: When there are no projects, show two CTAs:
  - "Create a project" — link to `/projects` (existing behaviour, now styled as a button-like link).
  - "Discover folders" — link to `/projects?discover=1`, with FolderPlus icon, so users can go straight to the Discover dialog.
- **Projects page**: When the URL contains `?discover=1`, open the Discover folders dialog automatically and replace the URL with `/projects` (so a refresh does not re-open the dialog). Implemented in **ProjectsListPageContent** via a `useEffect` that reads `searchParams?.get("discover")`, sets the discover dialog open state, and calls `router.replace("/projects", { scroll: false })`.

## Consequences

- New users see a clear path from "No projects yet" to either creating one project or discovering and adding multiple projects in one go.
- The `?discover=1` query param is a supported entry point; other surfaces (e.g. Command palette, docs) can link to `/projects?discover=1` to open the Discover dialog.
- Minimal changes: **DashboardOverview** (empty state UI) and **ProjectsListPageContent** (one effect and URL replace).
