# ADR 124: Sidebar nav groups — Dashboard at top, Tools and Work groups

## Status

Accepted.

## Context

The app shell sidebar listed all nav items in a single list plus a “Log & DB Data” section. Users requested a clearer structure: Dashboard at the top, then two groups — one for testing/architecture/database/ideas, another for projects/tickets/features/prompts.

## Decision

- **Dashboard at top**
  - Single “Dashboard” link at the top of the sidebar (no group label). Same behavior as before (`/` with tab `dashboard`).

- **Group 1: “Testing · Architecture · Data”**
  - Label (when expanded): “Testing · Architecture · Data”.
  - Items: Testing, Architecture, Database, Ideas (in that order).
  - Database remains the dashboard “all” data view (`/?tab=all`); moved from the previous “Log & DB Data” section into this group.

- **Group 2: “Projects · Tickets · Features”**
  - Label (when expanded): “Projects · Tickets · Features”.
  - Items: Projects, Tickets, Feature, Prompts (in that order).

- **Implementation**
  - In `src/components/app-shell.tsx`: replace flat `mainNavItems` and `logDataNavItems` with `dashboardNavItem`, `toolsNavItems`, and `workNavItems`. Render Dashboard first, then two sections with a shared `renderItem` helper and section labels. Design was removed from the sidebar to match the requested groups; the `/design` route remains available via URL.

## Consequences

- Sidebar is easier to scan: Dashboard first, then tools/data, then work (projects, tickets, features, prompts). Design is no longer in the sidebar but still reachable at `/design`; it can be re-added to a group later if desired.
